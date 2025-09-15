#!/usr/bin/env node

/**
 * Demo Mode Backend Verification Script for Gigster Garage
 * 
 * This script systematically tests all demo mode functionality to ensure
 * proper implementation and operation.
 */

const baseUrl = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  return { status: response.status, data, headers: response.headers };
}

async function testCreateDemoSession() {
  console.log('\n🧪 Testing Demo Session Creation...');
  
  try {
    const response = await makeRequest('/api/demo/create-session', {
      method: 'POST'
    });
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ Demo session created successfully');
      console.log(`   User ID: ${response.data.user.id}`);
      console.log(`   Username: ${response.data.user.username}`);
      console.log(`   Session expires in: ${response.data.session.remainingMinutes} minutes`);
      
      // Extract cookies for subsequent requests
      const cookies = response.headers.get('set-cookie');
      return { success: true, cookies, user: response.data.user, session: response.data.session };
    } else {
      console.log('❌ Demo session creation failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${response.data.message}`);
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    console.log('❌ Demo session creation error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testDemoSessionStatus(cookies) {
  console.log('\n🧪 Testing Demo Session Status...');
  
  try {
    const response = await makeRequest('/api/demo/session-status', {
      method: 'GET',
      headers: { Cookie: cookies }
    });
    
    if (response.status === 200 && response.data.isDemo) {
      console.log('✅ Demo session status retrieved successfully');
      console.log(`   Is Demo: ${response.data.isDemo}`);
      console.log(`   Authenticated: ${response.data.authenticated}`);
      console.log(`   Remaining Minutes: ${response.data.session?.remainingMinutes}`);
      return { success: true, data: response.data };
    } else {
      console.log('❌ Demo session status failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log('❌ Demo session status error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testDataIsolation(cookies) {
  console.log('\n🧪 Testing Data Isolation...');
  
  try {
    // Test accessing projects
    const projectsResponse = await makeRequest('/api/projects', {
      method: 'GET',
      headers: { Cookie: cookies }
    });
    
    // Test accessing clients
    const clientsResponse = await makeRequest('/api/clients', {
      method: 'GET',
      headers: { Cookie: cookies }
    });
    
    console.log(`✅ Demo user can access projects: ${projectsResponse.status === 200 ? 'Yes' : 'No'}`);
    console.log(`✅ Demo user can access clients: ${clientsResponse.status === 200 ? 'Yes' : 'No'}`);
    
    if (projectsResponse.status === 200) {
      console.log(`   Demo projects found: ${projectsResponse.data.length}`);
    }
    
    if (clientsResponse.status === 200) {
      console.log(`   Demo clients found: ${clientsResponse.data.length}`);
    }
    
    return { success: true, projects: projectsResponse.data, clients: clientsResponse.data };
  } catch (error) {
    console.log('❌ Data isolation test error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testEndDemoSession(cookies) {
  console.log('\n🧪 Testing Demo Session End...');
  
  try {
    const response = await makeRequest('/api/demo/end-session', {
      method: 'DELETE',
      headers: { Cookie: cookies }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Demo session ended successfully');
      console.log(`   Message: ${response.data.message}`);
      return { success: true };
    } else {
      console.log('❌ Demo session end failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${response.data.message}`);
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    console.log('❌ Demo session end error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testSessionStatusAfterEnd(cookies) {
  console.log('\n🧪 Testing Session Status After End...');
  
  try {
    const response = await makeRequest('/api/demo/session-status', {
      method: 'GET',
      headers: { Cookie: cookies }
    });
    
    if (response.data.isDemo === false || response.data.authenticated === false) {
      console.log('✅ Session properly invalidated after end');
      return { success: true };
    } else {
      console.log('❌ Session still active after end');
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return { success: false, error: 'Session not properly ended' };
    }
  } catch (error) {
    console.log('❌ Session status after end error:', error.message);
    return { success: false, error: error.message };
  }
}

async function runCompleteVerification() {
  console.log('🎮 Gigster Garage Demo Mode Backend Verification');
  console.log('================================================');
  
  const results = {
    createSession: null,
    sessionStatus: null,
    dataIsolation: null,
    endSession: null,
    sessionInvalidation: null
  };
  
  // Test 1: Create demo session
  const createResult = await testCreateDemoSession();
  results.createSession = createResult;
  
  if (!createResult.success) {
    console.log('\n❌ Cannot proceed with other tests - demo session creation failed');
    return results;
  }
  
  const cookies = createResult.cookies;
  
  // Test 2: Check session status
  const statusResult = await testDemoSessionStatus(cookies);
  results.sessionStatus = statusResult;
  
  // Test 3: Test data isolation
  const isolationResult = await testDataIsolation(cookies);
  results.dataIsolation = isolationResult;
  
  // Test 4: End demo session
  const endResult = await testEndDemoSession(cookies);
  results.endSession = endResult;
  
  // Test 5: Verify session is invalidated
  const invalidationResult = await testSessionStatusAfterEnd(cookies);
  results.sessionInvalidation = invalidationResult;
  
  // Summary
  console.log('\n📊 Verification Summary');
  console.log('======================');
  console.log(`Demo Session Creation: ${results.createSession.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Demo Session Status: ${results.sessionStatus?.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Data Isolation: ${results.dataIsolation?.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Demo Session End: ${results.endSession?.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Session Invalidation: ${results.sessionInvalidation?.success ? '✅ PASS' : '❌ FAIL'}`);
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r?.success).length;
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All demo mode backend functionality is working correctly!');
  } else {
    console.log('⚠️  Some demo mode functionality needs attention.');
  }
  
  return results;
}

// Run verification if this script is executed directly
if (require.main === module) {
  runCompleteVerification().catch(console.error);
}

module.exports = { runCompleteVerification };
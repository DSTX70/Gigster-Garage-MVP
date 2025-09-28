import { Link } from "wouter";

export default function Test404() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <p className="mb-4">This is a test page to debug routing.</p>
        <div className="space-x-4">
          <Link href="/" className="text-brand-teal hover:underline">Home</Link>
          <Link href="/login" className="text-brand-teal hover:underline">Login</Link>
          <Link href="/signup" className="text-brand-teal hover:underline">Signup</Link>
        </div>
      </div>
    </div>
  );
}
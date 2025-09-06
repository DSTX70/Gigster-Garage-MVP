import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, CheckCircle } from "lucide-react";
import type { UploadResult } from "@uppy/core";

/**
 * Example component demonstrating how to use ObjectUploader for file uploads.
 * This component shows the complete workflow:
 * 1. Get presigned upload URL from server
 * 2. Upload file to object storage
 * 3. Set ACL policy after upload
 * 4. Update application state
 */
export function FileUploadExample() {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Get upload parameters (presigned URL)
  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest("POST", "/api/documents/upload");
      return {
        method: "PUT" as const,
        url: response.uploadURL,
      };
    } catch (error) {
      console.error("Failed to get upload URL:", error);
      throw new Error("Failed to get upload URL");
    }
  };

  // Handle upload completion
  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    try {
      if (result.successful && result.successful.length > 0) {
        const uploadedFile = result.successful[0];
        const uploadURL = uploadedFile.uploadURL;

        // Set ACL policy for the uploaded file (make it private by default)
        await apiRequest("PUT", "/api/objects/acl", {
          objectURL: uploadURL,
          visibility: "private", // or "public" for public access
          aclRules: [], // Additional access rules if needed
        });

        setUploadedFiles(prev => [...prev, uploadURL]);

        toast({
          title: "Upload successful",
          description: `File "${uploadedFile.name}" uploaded successfully!`,
        });

        // Here you could also update your task/project/document record
        // For example:
        // await apiRequest("PUT", `/api/tasks/${taskId}`, {
        //   attachments: [...existingAttachments, normalizedPath]
        // });

        console.log("✅ File uploaded and ACL set:", uploadURL);
      }
    } catch (error) {
      console.error("Failed to process upload:", error);
      toast({
        title: "Upload error",
        description: "File uploaded but failed to process. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload Example
          </CardTitle>
          <CardDescription>
            Demonstrates secure file upload with proper access controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ObjectUploader
            maxNumberOfFiles={5}
            maxFileSize={10485760} // 10MB
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={handleUploadComplete}
            buttonClassName="w-full"
          >
            <div className="flex items-center justify-center gap-2 py-2">
              <Upload className="h-4 w-4" />
              <span>Upload Files</span>
            </div>
          </ObjectUploader>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Uploaded Files:</h4>
              <div className="space-y-1">
                {uploadedFiles.map((fileUrl, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <FileText className="h-4 w-4" />
                    <span className="truncate">File {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Features:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Secure presigned URL uploads</li>
              <li>Automatic ACL policy management</li>
              <li>Support for multiple file types</li>
              <li>Progress tracking and preview</li>
              <li>Error handling and notifications</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Usage in your components:
 * 
 * 1. Import the ObjectUploader component
 * 2. Implement handleGetUploadParameters to get presigned URL
 * 3. Implement handleUploadComplete to process the uploaded file
 * 4. Update your application state (tasks, projects, documents, etc.)
 * 
 * Example for adding to a task:
 * 
 * const addFileToTask = async (taskId: string, fileUrl: string) => {
 *   const task = await apiRequest("GET", `/api/tasks/${taskId}`);
 *   const updatedAttachments = [...(task.attachments || []), fileUrl];
 *   await apiRequest("PUT", `/api/tasks/${taskId}`, {
 *     attachments: updatedAttachments
 *   });
 * };
 */
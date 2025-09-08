import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  File, 
  Image, 
  X, 
  Check, 
  AlertCircle,
  Camera,
  Paperclip,
  Download,
  Eye,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadProgress: number;
  status: 'uploading' | 'completed' | 'error';
  preview?: string;
}

interface MobileFileUploadProps {
  onFilesChange?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  allowCamera?: boolean;
}

export function MobileFileUpload({
  onFilesChange,
  maxFiles = 5,
  maxFileSize = 10,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt'],
  className,
  disabled = false,
  showPreview = true,
  allowCamera = true
}: MobileFileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const generatePreview = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    });
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxFileSize}MB`,
        variant: "destructive",
      });
      return false;
    }

    // Check file type if specified
    if (acceptedTypes.length > 0) {
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(type.replace('*', '.*'));
      });

      if (!isAccepted) {
        toast({
          title: "Invalid file type",
          description: "Please select a supported file type",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const processFiles = async (fileList: FileList) => {
    if (files.length + fileList.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!validateFile(file)) continue;

      const preview = await generatePreview(file);
      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${i}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 0,
        status: 'uploading',
        preview: preview || undefined
      };

      newFiles.push(uploadedFile);

      // Simulate upload progress
      simulateUpload(uploadedFile);
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const simulateUpload = (file: UploadedFile) => {
    const interval = setInterval(() => {
      setFiles(prevFiles => {
        const updated = prevFiles.map(f => {
          if (f.id === file.id) {
            if (f.uploadProgress < 100) {
              const newProgress = Math.min(f.uploadProgress + Math.random() * 20, 100);
              return {
                ...f,
                uploadProgress: newProgress,
                status: newProgress === 100 ? 'completed' : 'uploading'
              };
            }
          }
          return f;
        });
        
        const currentFile = updated.find(f => f.id === file.id);
        if (currentFile?.uploadProgress === 100) {
          clearInterval(interval);
        }
        
        onFilesChange?.(updated);
        return updated;
      });
    }, 300);
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      processFiles(fileList);
    }
    event.target.value = '';
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const fileList = event.dataTransfer.files;
    if (fileList.length > 0) {
      processFiles(fileList);
    }
  }, [files, disabled, maxFiles, maxFileSize, acceptedTypes]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className={cn("space-y-4", className)} data-testid="mobile-file-upload">
      {/* Upload Area */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-all duration-200",
          isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Upload className="h-8 w-8 text-gray-600" />
          </div>
          
          <div className="space-y-2 mb-4">
            <p className="text-lg font-medium text-gray-900">Upload Files</p>
            <p className="text-sm text-gray-500">
              Drag and drop files here, or tap to browse
            </p>
            <p className="text-xs text-gray-400">
              Max {maxFiles} files, up to {maxFileSize}MB each
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || files.length >= maxFiles}
              className="flex-1"
              data-testid="button-browse-files"
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
            
            {allowCamera && (
              <Button
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                disabled={disabled || files.length >= maxFiles}
                className="flex-1"
                data-testid="button-camera"
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            data-testid="file-input"
          />
          
          {allowCamera && (
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="camera-input"
            />
          )}
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              Files ({files.length}/{maxFiles})
            </h4>
            {files.some(f => f.status === 'completed') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  files.filter(f => f.status === 'completed').forEach(f => {
                    // Create download link for completed files
                    const url = URL.createObjectURL(f.file);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = f.name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  });
                }}
                data-testid="button-download-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            )}
          </div>

          {files.map((file) => (
            <Card key={file.id} className="p-3" data-testid={`file-card-${file.id}`}>
              <div className="flex items-center space-x-3">
                {/* File Preview/Icon */}
                <div className="flex-shrink-0">
                  {showPreview && file.preview ? (
                    <img 
                      src={file.preview} 
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded border">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-1 ml-2">
                      {file.status === 'completed' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Done
                        </Badge>
                      )}
                      {file.status === 'error' && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-6 w-6 p-0"
                        data-testid={`button-remove-${file.id}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <div className="mt-2">
                      <Progress 
                        value={file.uploadProgress} 
                        className="h-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(file.uploadProgress)}% uploaded
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* File Type Info */}
      {acceptedTypes.length > 0 && (
        <div className="text-xs text-gray-500 text-center">
          Supported formats: {acceptedTypes.join(', ')}
        </div>
      )}
    </div>
  );
}
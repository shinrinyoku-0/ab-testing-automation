import React from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Alert } from "./ui/Alert";
import { Badge } from "./ui/Badge";

const FileInput = ({
  id,
  label,
  accept,
  required = false,
  file,
  onChange,
  helperText
}) => {
  return (
    <Card className="space-y-4 p-4">
      <Label htmlFor={id}>
        {label} {required && '*'}
      </Label>
      <Input 
        id={id}
        type="file"
        accept={accept}
        onChange={onChange}
        className="w-full"
        required={required}
      />
      {file && (
        <Badge className="text-sm">
          Uploaded: {file.name}
        </Badge>
      )}
      {helperText && (
        <Alert className="text-xs text-gray-500">
          {helperText}
        </Alert>
      )}
    </Card>
  );
};

export default FileInput;

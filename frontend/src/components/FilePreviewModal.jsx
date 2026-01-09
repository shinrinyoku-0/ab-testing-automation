import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Papa from 'papaparse';
import { Card, CardBody, CardHeader, Button, Spinner } from '@heroui/react';

const FilePreviewModal = ({ file, fileType, onClose }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFileContent = async () => {
      setLoading(true);
      setError(null);

      try {
        if (fileType === 'json') {
          const text = await file.text();
          const json = JSON.parse(text);
          setContent(json);
        } else if (fileType === 'csv') {
          const text = await file.text();
          Papa.parse(text, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
              setContent({
                headers: results.meta.fields,
                rows: results.data.slice(0, 10),
                totalRows: results.data.length
              });
            },
            error: (err) => {
              setError('Failed to parse CSV file');
              console.error('CSV parse error:', err);
            }
          });
        }
      } catch (err) {
        setError('Failed to load file content');
        console.error('File load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFileContent();
  }, [file, fileType]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <Card 
        className="max-w-5xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <CardHeader className="flex justify-between items-center border-b">
          <h3 className="text-lg font-semibold">
            {file.name}
          </h3>
          <Button
            isIconOnly
            variant="light"
            onPress={onClose}
            aria-label="Close preview"
          >
            <XMarkIcon className="w-6 h-6" />
          </Button>
        </CardHeader>

        {/* Content */}
        <CardBody className="flex-1 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Spinner label="Loading preview..." />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && content && fileType === 'json' && (
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs font-mono">
              {JSON.stringify(content, null, 2)}
            </pre>
          )}

          {!loading && !error && content && fileType === 'csv' && (
            <div>
              <div className="mb-2 text-sm text-gray-600">
                Showing first {content.rows.length} of {content.totalRows} rows
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y border">
                  <thead className="bg-gray-50">
                    <tr>
                      {content.headers.map((header, idx) => (
                        <th
                          key={idx}
                          className="px-4 py-2 text-left text-xs font-medium uppercase whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y">
                    {content.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-gray-50">
                        {content.headers.map((header, colIdx) => (
                          <td
                            key={colIdx}
                            className="px-4 py-2 text-sm whitespace-nowrap"
                          >
                            {row[header] !== null && row[header] !== undefined
                              ? String(row[header])
                              : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardBody>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <Button
            onPress={onClose}
            color="default"
            variant="flat"
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default FilePreviewModal;

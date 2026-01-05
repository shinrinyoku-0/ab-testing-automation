import { Alert, AlertDescription } from './ui/Alert.jsx';

const AlertMessage = ({ type, message }) => {
    const variants = {
        error: 'destructive',
        success: 'default',
        info: 'default',
    };

    if (!message) return null;

    return (
        <Alert variant={variants[type]} className="mb-4">
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
};

export default AlertMessage;


const ApiResponse = (res, statusCode,status, message = null,data = null) => {
    // Check if `res` is a valid Express response object
  
    // Validate `statusCode`
    if (typeof statusCode !== 'number' || isNaN(statusCode) || statusCode < 100 || statusCode > 599) {
      return res.status(500).json({
        message: 'error: Invalid statusCode code. Must be a number between 100 and 599.',
        data: null,
      });
    }
  
    // Validate `message`
    if (message !== null && typeof message !== 'string') {
      return res.status(500).json({
        message: 'error: Message must be a string or null.',
        data: null,
      });
    }
  
    // Prevent sensitive data exposure
    if (message && message.toLowerCase().includes('error')) {
      data = null;
    }
    if(status!=0 && status!=1){
      return res.status(500).json({
        message: 'error: status can only be 0 or 1. here 0 means failed and 1 means success.',
      });
    }
  
    // Final response
    return res.status(statusCode).json({
      status,
      message: message || (statusCode >= 400 ? 'An error occurred' : 'Success'),
      data,
    });
  };
  
  export default ApiResponse;
  
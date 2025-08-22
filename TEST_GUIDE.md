# 🧪 Testing Guide - .mat File Upload & Processing

## Quick Test Commands

### 1. Start the Backend
```cmd
cd backend
.\.venv\Scripts\Activate
uvicorn app.main:app --reload --port 8000
```

### 2. Start the Frontend  
```cmd
cd frontend
npm run dev
```

### 3. Run Automated Test
```cmd
python test_mat_upload.py
```

## Manual Testing Steps

### Step 1: Verify Backend is Running
- Go to http://localhost:8000/docs
- Check that all endpoints are available
- Test the `/health` endpoint

### Step 2: Verify Frontend is Running
- Go to http://localhost:3000 (or http://localhost:5173)
- Navigate to "Upload Vibration Data"
- Check that the form loads correctly

### Step 3: Test .mat File Upload

1. **Select a .mat file** from your test_data folder
2. **Check the form auto-fills**:
   - Machine: Should auto-select first machine
   - Sensor Position: "Drive End" 
   - Axis: "Horizontal"
   - Sampling Rate: "12000"
3. **Click "Upload & Process"**
4. **Watch the progress** - should show uploading, then processing
5. **Check the results** - should show health score and fault detection

## Troubleshooting

### Backend Issues

#### CORS Errors
```
Access to fetch at 'http://localhost:8000/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Fix**: Backend CORS is now configured for ports 3000, 5173, and 8080

#### Supabase Errors
```
Failed to initialize Supabase client: 'dict' object has no attribute 'headers'
```
**Fix**: This is expected - the system falls back to local storage when Supabase is not configured

#### File Upload Errors
```
Unsupported file type: .mat
```
**Fix**: .mat files are now explicitly supported in the allowed extensions

### Frontend Issues

#### API Connection Errors
```
Failed to fetch
```
**Fix**: 
1. Check backend is running on port 8000
2. Check CORS configuration
3. Check browser console for detailed errors

#### Form Not Enabling
**Fix**: 
1. Ensure files are selected
2. Check that machine is auto-selected
3. Verify all required fields are filled

### File Processing Issues

#### .mat File Loading Errors
```
Failed to load .mat file
```
**Fix**: 
1. Ensure scipy is installed: `pip install scipy`
2. Check file is valid MATLAB format
3. Check file size (should be > 0 bytes)

#### Analysis Errors
```
Analysis failed: No signal data found
```
**Fix**:
1. Check .mat file contains vibration data
2. Verify sampling rate is reasonable (1000-50000 Hz)
3. Check signal has sufficient length (>1000 samples)

## Expected Results

### Successful Upload
- ✅ File uploads without errors
- ✅ Progress bar shows 100%
- ✅ Success message appears
- ✅ "Process & Analyze Files" button becomes available

### Successful Analysis
- ✅ Analysis completes without errors
- ✅ Health score is calculated (0-100)
- ✅ Fault detections are identified
- ✅ Results are displayed in the UI

### Example Good Results
```json
{
  "health_score": 85,
  "fault_detections": [
    {
      "fault_type": "bearing_fault",
      "confidence": 0.75,
      "severity": 0.3
    }
  ],
  "recommendations": [
    "Monitor bearing condition closely",
    "Schedule maintenance within 30 days"
  ]
}
```

## Debug Information

### Backend Logs
Check the backend console for:
- File upload confirmations
- .mat file processing logs
- Analysis progress
- Any error messages

### Frontend Logs  
Check browser console (F12) for:
- API call responses
- Upload progress
- Error messages
- Network requests

### Test Files
Good test files should be:
- Valid .mat format
- Contain vibration time series data
- Have reasonable sampling rates (1kHz-50kHz)
- Be from actual machinery measurements

## Performance Expectations

### Upload Times
- Small files (<1MB): 1-5 seconds
- Medium files (1-10MB): 5-30 seconds  
- Large files (>10MB): 30+ seconds

### Analysis Times
- Simple analysis: 2-10 seconds
- Complex analysis: 10-60 seconds
- Very large files: 1-5 minutes

## Success Criteria

✅ **Upload Works**: .mat files upload without errors
✅ **Processing Works**: Files are analyzed and results returned
✅ **UI Works**: Frontend shows progress and results clearly
✅ **Error Handling**: Meaningful error messages for failures
✅ **Performance**: Reasonable response times for typical files

If all criteria are met, the system is working correctly! 🎉
# Save Postman Requests + Results

## 1. Save Individual Request
1. Click **Save** (top-right)
2. Name: "MAVIS Sensor Test"
3. **Save** to Collection "MAVIS API"

## 2. Save Response (3 ways):

**A. Screenshot**
```
Request → Response → Screenshot icon (camera)
```

**B. Export Response**
```
Response → Save Response → Save to file
Folder: C:\Users\chira\Desktop\M.A.V.I.S\postman_results\
```

**C. Test Results**
```
Tests tab → Run Collection → Save Report → JSON/HTML
```

## 3. Collection Run (All tests)
```
Collections → MAVIS API → Run
New folder: postman_results/
Save responses automatically
```

## 4. Quick Folder Setup
```
Create folder: postman_results/
- health_response.json
- post_sensor.json  
- get_latest.json
- get_history.json
```

**Pro Tip:** Use Collection Variables:
- `base_url` = `http://localhost:5000`

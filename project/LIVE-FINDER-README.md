# Live Finder - Real-time CCTV Monitoring System

The Live Finder module is a powerful real-time monitoring system that integrates with CCTV cameras to provide instant detection and alerts for persons, vehicles, and incidents.

## Key Features

### 1. Live CCTV Camera Integration
- Connect up to 10 live CCTV camera feeds
- Support for RTSP, HTTP, and other streaming protocols
- Location tagging for each camera
- Dynamic grid layout with single/multi-view options
- Camera status monitoring

### 2. Person Detection
- Upload an image to search for a specific person across all cameras
- Real-time face detection and matching
- Adjustable precision levels for different environments
- Instant notifications when a match is found
- Bounding box highlighting of detected persons

### 3. Vehicle Detection & License Plate Recognition
- Search for vehicles by license plate number
- Optional vehicle type filtering
- Real-time license plate recognition
- Automatic suggestions for previously detected plates
- Visual highlighting of detected vehicles

### 4. Incident Detection
- Automatic detection of:
  - Accidents
  - Fires
  - Violence/Fights
  - Building Collapses
  - Unusual Crowd Gatherings
- Configurable alert methods (visual, sound, email)
- Emergency reporting functionality
- Incident snapshots for documentation

### 5. Traffic Analysis
- Real-time vehicle counting
- Traffic categorization (Low, Medium, High)
- Traffic heatmap visualization
- Trend analysis with charts
- Configurable update frequency

### 6. Comprehensive Reporting
- All detections logged automatically
- Filtering by detection type, camera, and time
- Export functionality for reports
- Integration with the main Reports dashboard
- Snapshot evidence with timestamps

## Technical Implementation

### Frontend Components
- Camera Grid: Displays live feeds with detection overlays
- Detection Panels: UI for different detection types
- Results Panel: Shows detection history and details
- Alert System: Provides real-time notifications

### Backend Services
- Stream Processing: Handles video streams from cameras
- AI Detection Models: Processes video frames for detections
- Alert Management: Manages notification delivery
- Data Storage: Logs detection events and snapshots

### AI Models Used
- Face Recognition: For person detection and matching
- Object Detection: For vehicle and incident detection
- OCR: For license plate recognition
- Anomaly Detection: For unusual event identification

## Usage Instructions

1. **Adding Cameras**:
   - Click "Add Camera" button
   - Enter camera name, location, and stream URL
   - Use demo streams for testing if needed

2. **Person Search**:
   - Click "Person Search" button
   - Upload an image of the person
   - Select precision level and target cameras
   - Click "Start Search"

3. **Vehicle Search**:
   - Click "Vehicle Search" button
   - Enter license plate number
   - Select vehicle type (optional)
   - Click "Start Search"

4. **Incident Detection**:
   - Click "Incident Detection" button
   - Select incident types to monitor
   - Choose alert method
   - Click "Start Monitoring"

5. **Traffic Analysis**:
   - Click "Traffic Analysis" button
   - Set update frequency
   - Select display mode
   - Click "Start Analysis"

## Performance Considerations

- **Bandwidth**: Each camera stream requires approximately 1-2 Mbps
- **Processing Power**: Recommended minimum of 4 CPU cores and 8GB RAM
- **Storage**: Approximately 1GB per hour per camera for detection logs and snapshots
- **Latency**: Typical detection delay of 1-3 seconds depending on network conditions

## Integration Points

- **Reports System**: All detections are automatically logged in the Reports system
- **Notification System**: Alerts can be sent via email, SMS, or in-app notifications
- **User Management**: Camera access can be restricted based on user permissions
- **External Systems**: API available for integration with third-party security systems

## Future Enhancements

- Mobile app for remote monitoring and alerts
- AI-powered predictive incident detection
- Integration with smart city infrastructure
- Advanced behavioral analysis
- Multi-location coordination for large-scale deployments
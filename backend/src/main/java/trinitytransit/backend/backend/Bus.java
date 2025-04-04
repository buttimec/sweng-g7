package trinitytransit.backend.backend;

public class Bus {
    private String vehicleId;
    private String startTime;
    private String startDate;
    private String scheduleRelationship;
    private String routeShortName;
    private String routeLongName;
    private String transportation;
    private String tripHeadsign;
    private int directionId;
    private double latitude;
    private double longitude;
    private long timestamp;

    // Constructor
    public Bus(String vehicleId, String routeShortName, String routeLongName, String transportation, String tripHeadsign, String startTime,
               String startDate, String scheduleRelationship, int directionId, double latitude, double longitude, long timestamp) {
        this.vehicleId = vehicleId;
        this.startTime = startTime;
        this.startDate = startDate;
        this.scheduleRelationship = scheduleRelationship;
        this.routeShortName = routeShortName;
        this.transportation = transportation;
        this.routeLongName = routeLongName;
        this.tripHeadsign = tripHeadsign;
        this.routeLongName = routeLongName;
        this.directionId = directionId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamp = timestamp;
    }

    // Getters and setters
    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getScheduleRelationship() {
        return scheduleRelationship;
    }

    public void setScheduleRelationship(String scheduleRelationship) {
        this.scheduleRelationship = scheduleRelationship;
    }

    public String getRouteShortName() {
        return routeShortName;
    }

    public void setRouteShortName(String routeShortName) {
        this.routeShortName = routeShortName;
    }

    public String getRouteLongName() {
        return routeLongName;
    }

    public void setRouteLongName(String routeLongName) {
        this.routeShortName = routeLongName;
    }

    public String getTransportation() {
        return transportation;
    }

    public void setTransportation(String transportation) {
        this.transportation = transportation;
    }

    public String getTripHeadsign() {
        return tripHeadsign;
    }

    public void setTripHeadsign(String tripHeadsign) {
        this.tripHeadsign = tripHeadsign;
    }

    public int getDirectionId() {
        return directionId;
    }

    public void setDirectionId(int directionId) {
        this.directionId = directionId;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}

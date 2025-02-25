package trinitytransit.backend.backend;

import java.util.List;

public class TripUpdate {
    private String tripId;
    private String routeId;
    private String routeShortName;
    private String startTime;
    private String startDate;
    private String transportation;
    private int directionId;
    private int totalDelay;
    private String lastStopId;
    private String stopName;
    private List<StopTimeUpdate> stopTimeUpdates;

    public TripUpdate(String tripId, String routeId, String routeShortName, String startTime, String startDate,
                      int directionId, int totalDelay, String lastStopId, String stopName, String transportation,
                      List<StopTimeUpdate> stopTimeUpdates) {
        this.tripId = tripId;
        this.routeId = routeId;
        this.routeShortName = routeShortName;
        this.startTime = startTime;
        this.startDate = startDate;
        this.directionId = directionId;
        this.totalDelay = totalDelay;
        this.lastStopId = lastStopId;
        this.stopName = stopName;
        this.transportation = transportation;
        this.stopTimeUpdates = stopTimeUpdates;
    }

    public String getTripId() { return tripId; }
    public String getRouteId() { return routeId; }
    public String getRouteShortName() { return routeShortName; }
    public String getStartTime() { return startTime; }
    public String getStartDate() { return startDate; }
    public int getDirectionId() { return directionId; }
    public int getTotalDelay() { return totalDelay; }
    public String getLastStopId() { return lastStopId; }
    public String getStopName() { return stopName; }
    public String getTransportation() { return transportation; }
    public List<StopTimeUpdate> getStopTimeUpdates() { return stopTimeUpdates; }

    @Override
    public String toString() {
        return "TripUpdate { " +
                "tripId='" + tripId + '\'' +
                ", routeId='" + routeId + '\'' +
                ", routeShortName='" + routeShortName + '\'' +
                ", startTime='" + startTime + '\'' +
                ", startDate='" + startDate + '\'' +
                ", directionId=" + directionId +
                ", totalDelay=" + totalDelay +
                ", lastStopId='" + lastStopId + '\'' +
                ", stopName='" + stopName + '\'' +
                ", Transportation='" + transportation + '\'' +
                ", stopTimeUpdates=" + stopTimeUpdates +
                " }";
    }

    public static class StopTimeUpdate {
        private String stopId;
        private int stopSequence;
        private int arrivalDelay;
        private int departureDelay;

        public StopTimeUpdate(String stopId, int stopSequence, int arrivalDelay, int departureDelay) {
            this.stopId = stopId;
            this.stopSequence = stopSequence;
            this.arrivalDelay = arrivalDelay;
            this.departureDelay = departureDelay;
        }

        // ✅ Add Getters (Required for correct access)
        public String getStopId() { return stopId; }
        public int getStopSequence() { return stopSequence; }
        public int getArrivalDelay() { return arrivalDelay; }
        public int getDepartureDelay() { return departureDelay; }

        @Override
        public String toString() {
            return "{stopId='" + stopId + "', stopSequence=" + stopSequence +
                    ", arrivalDelay=" + arrivalDelay + ", departureDelay=" + departureDelay + "}";
        }
    }
}

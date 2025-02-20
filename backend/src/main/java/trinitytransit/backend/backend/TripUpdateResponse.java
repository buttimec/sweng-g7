package trinitytransit.backend.backend;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class TripUpdateResponse {
    private Header header;
    private List<TripUpdateEntity> entity;

    public Header getHeader() {
        return header;
    }

    public void setHeader(Header header) {
        this.header = header;
    }

    public List<TripUpdateEntity> getEntity() {
        return entity;
    }

    public void setEntity(List<TripUpdateEntity> entity) {
        this.entity = entity;
    }

    public static class Header {
        private String gtfs_realtime_version;
        private String incrementality;
        private String timestamp;

        public String getGtfs_realtime_version() { return gtfs_realtime_version; }
        public void setGtfs_realtime_version(String gtfs_realtime_version) { this.gtfs_realtime_version = gtfs_realtime_version; }

        public String getIncrementality() { return incrementality; }
        public void setIncrementality(String incrementality) { this.incrementality = incrementality; }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    }

    public static class TripUpdateEntity {
        private String id;

        @JsonProperty("trip_update")  // ✅ Ensure correct mapping to JSON field "trip_update"
        private TripUpdate tripUpdate;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public TripUpdate getTripUpdate() { return tripUpdate; }
        public void setTripUpdate(TripUpdate tripUpdate) { this.tripUpdate = tripUpdate; }

        public static class TripUpdate {
            @JsonProperty("trip") // ✅ Ensure correct mapping to JSON field "trip"
            private Trip trip;

            @JsonProperty("stop_time_update") // ✅ Correctly map "stop_time_update"
            private List<StopTimeUpdate> stopUpdates;

            private String timestamp;

            public Trip getTrip() { return trip; }
            public void setTrip(Trip trip) { this.trip = trip; }

            public List<StopTimeUpdate> getStopUpdates() { return stopUpdates; }
            public void setStopUpdates(List<StopTimeUpdate> stopUpdates) { this.stopUpdates = stopUpdates; }

            public String getTimestamp() { return timestamp; }
            public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

            public static class Trip {
                @JsonProperty("trip_id")
                private String tripId;

                @JsonProperty("start_time")
                private String startTime;

                @JsonProperty("start_date")
                private String startDate;

                @JsonProperty("schedule_relationship")
                private String scheduleRelationship;

                @JsonProperty("route_id")
                private String routeId;

                @JsonProperty("direction_id")
                private int directionId;

                public String getTripId() { return tripId; }
                public void setTripId(String tripId) { this.tripId = tripId; }

                public String getStartTime() { return startTime; }
                public void setStartTime(String startTime) { this.startTime = startTime; }

                public String getStartDate() { return startDate; }
                public void setStartDate(String startDate) { this.startDate = startDate; }

                public String getScheduleRelationship() { return scheduleRelationship; }
                public void setScheduleRelationship(String scheduleRelationship) { this.scheduleRelationship = scheduleRelationship; }

                public String getRouteId() { return routeId; }
                public void setRouteId(String routeId) { this.routeId = routeId; }

                public int getDirectionId() { return directionId; }
                public void setDirectionId(int directionId) { this.directionId = directionId; }
            }
        }

        public static class StopTimeUpdate {
            @JsonProperty("stop_sequence")
            private int stopSequence;

            @JsonProperty("stop_id")
            private String stopId;

            @JsonProperty("schedule_relationship")
            private String scheduleRelationship;

            @JsonProperty("arrival")
            private ArrivalDeparture arrival;

            @JsonProperty("departure")
            private ArrivalDeparture departure;

            public int getStopSequence() { return stopSequence; }
            public void setStopSequence(int stopSequence) { this.stopSequence = stopSequence; }

            public String getStopId() { return stopId; }
            public void setStopId(String stopId) { this.stopId = stopId; }

            public String getScheduleRelationship() { return scheduleRelationship; }
            public void setScheduleRelationship(String scheduleRelationship) { this.scheduleRelationship = scheduleRelationship; }

            public ArrivalDeparture getArrival() { return arrival; }
            public void setArrival(ArrivalDeparture arrival) { this.arrival = arrival; }

            public ArrivalDeparture getDeparture() { return departure; }
            public void setDeparture(ArrivalDeparture departure) { this.departure = departure; }
        }

        public static class ArrivalDeparture {
            @JsonProperty("delay")
            private int delay;

            public int getDelay() { return delay; }
            public void setDelay(int delay) { this.delay = delay; }
        }
    }
}

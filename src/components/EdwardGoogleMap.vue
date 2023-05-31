<template>
    <el-container style="text-align: center; align-items: center; margin:0; height: 85vh; width: 95vw">
        <el-main id="main" style=" max-width: 70vw; height: 750px; padding: 0">
            <div>
                <input id="pac-input" type="text" placeholder="Search Box">
                <div id="map"></div>
            </div>
        </el-main>
        <el-aside id="rightElement" style="text-align: center; height: 795px; width: 400px; margin-left: 20px">
            <div style="margin-bottom: 10px">
                <el-button-group>
                    <el-row :gutter="20">
                        <el-button @click="deleteMarker"  type="primary" :icon="Delete">Delete</el-button>
                        <el-button @click="deleteMarkers"  type="danger" :icon="Delete">Delete All Markers</el-button>
                        <el-button @click="refreshPage"  type="primary" :icon="Refresh">Refresh</el-button>
                    </el-row>
                </el-button-group>
            </div>
            <div style="height: 420px; border: 1px whitesmoke solid">
                <table style="height:100%; width: 100%; text-align: left;">
                    <tr v-for="marker in displayedMarkers" :key="marker.id">
                        <el-checkbox v-model="marker.checked" :label="marker.title" size="large"></el-checkbox>
                    </tr>
                </table>
                <div style="text-align: center; align-items: center; display: flex; justify-content: center">
                    <el-pagination
                        layout="prev, pager, next"
                        :page-count="totalPages"
                        @current-change="changePage"
                        default-page-size="{{itemsPerPage}}"
                    >
                    </el-pagination>
                </div>
                <div style="">
                    <div style=" align-items: center; text-align:left; margin-top: 1px;">
                        <el-card>
                            <template #header>
                                <span>Last Marker Info:</span>
                            </template>
                            <div>Name: {{ lastMarker.title }}</div>
                            <div>Local Time: {{time}} {{ timeZone }} </div>
                        </el-card>
                    </div>
                </div>
                <div>
                    <el-card style="justify-content: space-between; align-items: center; margin-top: 5px; text-align: left; ">
                        <template #header>
                            <span>Your Current location is:</span>
                        </template>
                        <div>{{ myLocation }}</div>
                    </el-card>
                </div>
            </div>


<!--            <div>{{markers.length}} {{displayedMarkers.length}}</div>-->

        </el-aside>
    </el-container>
</template>

<script>
import {ref, reactive, toRaw} from 'vue';
import {Delete, Refresh} from "@element-plus/icons-vue";
export default {
    mounted() {
        this.initMap();
    },

    data() {
        return {
            apiKey: 'AIzaSyB4s7GxahAfekMSXUQ_A_zvS5VJjacmad8',
            map: null,
            searchBox: null,
            markers: [],
            currentPage: 1,
            itemsPerPage: 10,
            displayedMarkers: [],
            id: 0,
            lastMarker: '',
            timeZone: null,
            time:null,
            infoWindow: null,
            myLocation: null,
            tableData:[]
        };
    },

    computed: {
        Refresh() {
            return Refresh
        },
        Delete() {
            return Delete
        },
        totalPages() {
            return Math.ceil(this.markers.length / this.itemsPerPage);
        },
    },

    methods: {
        initMap() {
            this.map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 0, lng: 0 },
                zoom: 2,
                mapTypeId: 'roadmap',
            })

            this.infoWindow = new google.maps.InfoWindow();

            const locationButton = document.createElement("button")

            locationButton.textContent = "Pan to Current Location"
            locationButton.classList.add("custom-map-control-button")
            this.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(locationButton)

            locationButton.addEventListener("click", () => {
                // Try HTML5 geolocation.
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const pos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                            };

                            this.map.setCenter(pos)
                            this.map.setZoom(16)

                            const geocoder = new google.maps.Geocoder()

                            const geocoderRequest = {
                                location: pos,
                                language: "en"
                            };

                            geocoder.geocode(geocoderRequest, (results, status) => {
                                if (status === "OK") {
                                    if (results[0]) {
                                        const addressComponents = results[0].address_components;

                                        const city = addressComponents.find(component => {
                                            return component.types.includes("locality")
                                        })
                                        const province = addressComponents.find(component => {
                                            return component.types.includes("administrative_area_level_1");
                                        })
                                        const country = addressComponents.find(component => {
                                            return component.types.includes("country")
                                        })

                                        if (city) {
                                            console.log("City:", city.long_name)
                                        } else {
                                            console.log("City information not found.")
                                        }

                                        if (province) {
                                            console.log("Province:", province.long_name)
                                        } else {
                                            console.log("Province information not found.")
                                        }

                                        if (country) {
                                            console.log("Country:", country.long_name)
                                        } else {
                                            console.log("Country information not found.")
                                        }

                                        this.myLocation = city.long_name + ", " + province.long_name + ", " + country.long_name
                                    } else {
                                        console.log("No results found.");
                                    }
                                } else {
                                    console.log("Geocoder failed due to: " + status);
                                }
                            })

                        },
                        () => {
                            this.handleLocationError(true, infoWindow, this.map.getCenter())

                        }
                    )
                } else {
                    this.handleLocationError(false, infoWindow, this.map.getCenter())

                }

            })

            const input = document.getElementById('pac-input')

            this.searchBox = new google.maps.places.SearchBox(input)

            this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input)

            this.searchBox.addListener('places_changed', this.handlePlacesChanged)

        },

        handleLocationError(browserHasGeolocation, infoWindow, pos) {
            infoWindow.setPosition(pos)
            infoWindow.setContent(
                browserHasGeolocation
                    ? "Error: The Geolocation service failed."
                    : "Error: Your browser doesn't support geolocation."
            )
        },

        handlePlacesChanged() {
            const places = this.searchBox.getPlaces()

            if (places.length === 0) {
                return
            }

            // this.markers.forEach((marker) => toRaw(marker).setMap(null))
            // this.markers = [];

            const bounds = new google.maps.LatLngBounds()

            places.forEach((place) => {
                if (!place.geometry || !place.geometry.location) {
                    console.log('Returned place contains no geometry')
                    return
                }

                const icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25),
                }

                const marker = new google.maps.Marker({
                    map: this.map,
                    icon,
                    title: place.name,
                    position: place.geometry.location,
                })
                marker.checked = false
                marker.id = this.id++
                this.markers.push(marker)

                if (place.geometry.viewport) {
                    bounds.union(place.geometry.viewport)
                } else {
                    bounds.extend(place.geometry.location)
                }
            })

            this.map.fitBounds(bounds)
            this.updateDisplayedMarkers()
        },

        deleteMarker() {
            this.displayedMarkers.forEach((marker) => {
                if(marker.checked){
                    const findIndex = this.markers.findIndex(m => m.title === marker.title)
                    if(findIndex !== -1){
                        toRaw(this.markers[findIndex]).setMap(null)
                        this.markers.splice(findIndex, 1)
                    }
                    this.displayedMarkers.slice(marker, 1)
                }
            })
            this.updateDisplayedMarkers()
        },
        deleteMarkers() {
            this.markers.forEach((marker) => {
                const markerRaw = toRaw(marker)
                markerRaw.setMap(null)
            })
            // this.markers.map((marker) => toRaw(marker).setMap(null))
            this.markers = []
            this.displayedMarkers = []
        },

        changePage(page) {
            this.currentPage = page
            this.updateDisplayedMarkers()
        },

        updateDisplayedMarkers() {
            this.displayedMarkers=[]
            const startIndex = (this.currentPage - 1) * this.itemsPerPage
            const endIndex = startIndex + this.itemsPerPage
            const tmpMarkers = this.markers.slice(startIndex, endIndex)
            tmpMarkers.forEach((marker) => {
                const tmpMarker = {
                    id: marker.id,
                    title: marker.title,
                    checked: marker.checked
                }
                this.displayedMarkers.push(tmpMarker)
            })

            // this.displayedMarkers = this.markers.slice(startIndex, endIndex)
            if(this.markers.length > 0){
                this.lastMarker = this.markers[this.markers.length-1]
                this.getTimeZone()
            }
            else{
                this.lastMarker = ''
                this.timeZone = null
                this.time = null
            }

        },


        getTimeZone() {
            const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${this.lastMarker.position.lat()},${this.lastMarker.position.lng()}&timestamp=${Math.floor(Date.now() / 1000)}&key=${this.apiKey}`

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    const timeZoneId = data.timeZoneId
                    this.timeZone = timeZoneId
                    const currentTime = Date.now()
                    const localDate = new Date(currentTime).toLocaleString('en-US', {
                        timeZone: this.timeZone,
                    })
                    this.time = localDate

                })
                .catch(error => {
                    console.error('Error:', error)
                });
        },
        refreshPage() {
            this.updateDisplayedMarkers()
        },

    },
};
</script>

<style>
#map {
    height: 730px;
    width: 1300px;
}
#pac-input{
    height: 40px;
    width: 400px;
}
.custom-map-control-button {
    background-color: #fff;
    border: 0;
    border-radius: 2px;
    box-shadow: 0 1px 4px -1px rgba(0, 0, 0, 0.3);
    margin: 10px;
    padding: 0 0.5em;
    font: 400 18px Roboto, Arial, sans-serif;
    overflow: hidden;
    height: 40px;
    cursor: pointer;
}
.custom-map-control-button:hover {
    background: rgb(235, 235, 235);
}
#pac-input {
    background-color: #fff;
    font-family: Roboto;
    font-size: 15px;
    font-weight: 300;
    margin-left: 12px;
    padding: 0 11px 0 13px;
    text-overflow: ellipsis;
    width: 400px;
}

#pac-input:focus {
    border-color: #4d90fe;
}


table tr:nth-child(n+3):nth-child(-n+5) {
    border-bottom: 1px solid black;
}

table tr:nth-child(even) {
    background-color: #f2f2f2;
}
/*table {*/
/*    width: 70%;*/
/*    height: 100%;*/
/*}*/
#main{
    background: white;
}
</style>

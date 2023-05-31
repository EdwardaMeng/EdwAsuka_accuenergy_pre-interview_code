<template id="app">
    <el-container style="max-height: 100%; max-width: 100%; align-items: center; padding: 0; margin: 0; height: 97vh; width: 100%">
        <el-header id="el-header" style="display: flex; align-items: center; max-width: 100%;">
            <el-icon style="margin-right: 20px" size="40px" @click="drawer = true"><Document /></el-icon>
            <el-divider direction="vertical"></el-divider>
            <h3 style="margin-left: 20px;">A Simple Web Page with Geolocation and Map functions, click on the icon for more information =D</h3>
        </el-header>
        <el-divider style="max-width: 100%; margin-bottom:5px"></el-divider>
        <el-main id="main" style="height:100%; width: 100%; max-height:100%; max-width: 100%; margin:0">
            <New></New>
        </el-main>
    </el-container>
    <el-drawer v-model="drawer" title="Info" :with-header="false">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <h3>About this Page</h3>
                </div>
            </template>
            <p>This page is implemented by <b>Vue + Vite + Element Plus UI</b>.</p>
            <p>
                It utilizes:
                <ul>
                    <li>Google Maps JavaScript API</li>
                    <li>Google Geolocation API</li>
                    <li>Google Places API</li>
                </ul>
            </p>
        </el-card>
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <h3>Where Am I</h3>
                </div>
            </template>
            <p>You can click on the "Pan to Current Location" button to get your current location.</p>
        </el-card>
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <h3>Search For a Location</h3>
                </div>
            </template>
            <p>You can enter name or address to search for a location. Locations been searched will be recorded on map as a marker, and also in the table.</p>
        </el-card>
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <h3>Search Record</h3>
                </div>
            </template>
            <p>You can view all locations that been searched on map. You can delete one or more records in the table and on the map based on your need.</p>
        </el-card>
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <h3>Latest Searched Location</h3>
                </div>
            </template>
            <p>You can see detail of the latest location been searched with local time and time zone.</p>
        </el-card>
    </el-drawer>



</template>

<script setup>
import New from "./components/EdwardGoogleMap.vue"
import { ref } from 'vue'
import {Document} from "@element-plus/icons-vue";
const drawer = ref(false)
</script>

<style scoped>
#el-header{
    height: 10px;
    width: 100%;
    background: white;
    padding: 0;
    margin-top: 8px;
}
.el-card{
    margin-bottom: 20px;
}

</style>

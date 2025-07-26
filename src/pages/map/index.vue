<route lang="json5">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
}
</route>
<template>
  <view>
    <view id="map" class="map"></view>
  </view>
</template>

<script module="ol" lang="renderjs">
//import 'ol/ol.css'
import { Map, View } from 'ol'
import ollayerTile from 'ol/layer/Tile'
import olsourceOSM from 'ol/source/OSM'
import {get as getProjection} from 'ol/proj';
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { ScaleLine, defaults as defaultControls, MousePosition } from 'ol/control'
import { transform } from 'ol/proj'
export default {
    name: 'c-ol-map',
    data () {
        return {
            map:null,
            view:null
        }
    },
    mounted(){
       this.initMap()
    },
	methods:{
		// 初始化天地图
		initMap(){
			let that = this
			//天地图影像
			var tdt = new TileLayer({
			  source: new XYZ({
			    url: 'http://t2.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=cef191b507ff5cb698811cd8a9b11ca0',
			    projection: 'EPSG:3857',
			    crossOrigin: '*',
			  }),
			})
			//天地图标注
			var tdtLabel = new TileLayer({
			  source: new XYZ({
			    url: 'http://t2.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=cef191b507ff5cb698811cd8a9b11ca0',
			    projection: 'EPSG:3857',
			  }),
			})
			this.map = new Map({
			  controls: defaultControls({
			    attribution: false,
			    zoom: false,
			    rotate: false,
			  }),
			  target: 'map',
			  layers: [tdt, tdtLabel],
			  view: new View({
			    projection: 'EPSG:3857',
			    center: transform([102.712251, 25.040609], 'EPSG:4326', 'EPSG:3857'),
			    // center: [102.712251, 25.040609],
			    zoom: 10,
			    maxZoom: 18, //最大缩放级别
			  }),
			})
		}
	}
}
</script>

<style scoped>
.map {
  height: 600px;
}
</style>

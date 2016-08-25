var map;
var marker;
var markers = [];
var infowindow;
var image = url('https://jimyah.github.io/Vue-food-map/images/map-icon.png');

function initMap() {

  var kaohsiung = {
    lat: 22.665768464,
    lng: 120.32489392799998
  };

  map = new google.maps.Map(document.getElementById('map'),{
    zoom: 10,
    center: kaohsiung
  });

  infowindow = new google.maps.InfoWindow({
    content: ''
  });

  resetMarkers(map, food.$data.items);
}

function resetMarkers(whichMap, data) {
  for(var i = 0; markers.length > i; i++) {
    markers[i].setMap(null);
  }
  markers = [];
  console.log('clear all markers');
  for(i in data) {
    var place = data[i];
    marker = new google.maps.Marker({
      title: place.Name,
      position: {
        lat: Number(place['Py']),
        lng: Number(place['Px'])
      },
      icon: image
    });
    marker.set('id',place.Id);
    markers.push(marker);
    marker.setMap(whichMap);
  }
}



var vmap = new Vue({
  el: '#vmap',
  data: {
    currenArea: '全部地區',
    matchArea: [],
  },
  watch: {
    matchArea: function(where) {
      resetMarkers(map, where);
      console.log(where);
    }
  },
  // methods: {
  //   areaFilter: function() {
  //     foodInThisArea = [];
  //     for(var i = 0; food.$data.items.length > i; i++) {
  //       if(this.currenArea == food.$data.items[i].area) {
  //         foodInThisArea.push(food.$data.items[i]);
  //       }else if(this.currenArea == '全部地區') {
  //         foodInThisArea.push(food.$data.items[i]);
  //       }
  //     }
  //   },
  //   setMatchArea: function() {
  //     matchArea = [];
  //     for(var i = 0; foodInThisArea.length > i; i++) {
  //       matchArea.push(foodInThisArea[i]);
  //     }
  //   }
  // }
})

var api = 'https://data.kaohsiung.gov.tw/Opendata/DownLoad.aspx?Type=2&CaseNo1=AV&CaseNo2=2&FileType=1&Lang=C&FolderType=';
var foodInThisArea;

var food = new Vue({
  el: '#food-app',
  data: {
    areas: [],
    items: [],
    matchArea: [],
    currenArea: '全部地區',
  },
  created: function() {
    this.fetchData();
    this.matchArea = this.items;
  },
  watch: {
    currenArea: function(where) {
      this.areaFilter();
      this.setMatchArea();
      vmap.$data.currenArea = where;
    },
    matchArea: function(val) {
      vmap.$data.matchArea = val;
      console.log(val);
    }
  },
  methods: {
    fetchData: function() {
      var self = this;
      $.ajax({
        type: 'GET',
        url: api,
        async: false,
        success: function(data) {
        var thisData = JSON.parse(data);
        console.log(thisData);
        for(var i = 0; thisData.length > i; i++){
          self.items.push(thisData[i]);

          } // for end
        }

      }); // ajax end

      var areaGroup = {};
      for(var i = 0; self.items.length > i; i++) {
        self.items[i].area = self.items[i].Add.substr(3, 3);
        if(areaGroup[self.items[i].area] == null){
          areaGroup[self.items[i].area] = [];
          areaGroup[self.items[i].area].push({area: self.items[i].area});
        }else {
          areaGroup[self.items[i].area].push({area: self.items[i].area});
        }
      }
      self.areas = Object.keys(areaGroup);
      console.log(self.areas);
    },
    showInfo: function(id) {
      console.log(id);
      infowindow.close();
      for(var i in this.items){
        if(this.items[i].Id == id){
          infowindow.setContent(
            '<p class="mapInfo">'+ this.items[i].Name +'</p>' + '<p class="mapInfo">'+ this.items[i].Add +'</p>'
          );
        }
      }
      for(var i in markers) {
        if(markers[i].id == id) {
          infowindow.open(map, markers[i]);
        }
      }
    },
    markerAnimation: function(id) {
      for(var i in markers) {
        if(markers[i].id == id) {
          markers[i].setAnimation(google.maps.Animation.BOUNCE);
        }
      }
    },
    stopMarkerAnimation: function(id) {
      for(var i in markers) {
        if(markers[i].id == id) {
          markers[i].setAnimation(null);
        }
      }
    },
    rePanMapTo: function (where) {
        var sumOfLat = 0;
        var sumOfLng = 0;
        var count = 0;
        if (this.currenArea == '全部地區') {
            map.setZoom(10);
            for (var i in this.items) {
                sumOfLat += Number(this.items[i].Py);
                sumOfLng += Number(this.items[i].Px);
                count++;
            }
        } else {
            map.setZoom(14);
            for (var i in this.items) {
                if (this.items[i].area == where) {
                    sumOfLat += Number(this.items[i].Py);
                    sumOfLng += Number(this.items[i].Px);
                    count++;
                }
            }
        }

        var panToWhere = {
            lat: sumOfLat / count
            , lng: sumOfLng / count
        }
        map.panTo(panToWhere);

        console.log("Map pan to " + JSON.stringify(panToWhere) + " completed!");
    },
    areaFilter: function() {
      foodInThisArea = [];
      console.log("currentArea = " + this.currenArea);
      for(var i = 0; this.items.length > i; i++) {
        if(this.currenArea == this.items[i].area) {
          foodInThisArea.push(this.items[i]);
        }else if(this.currenArea == '全部地區') {
          foodInThisArea.push(this.items[i]);
        }
      }
    },
    setMatchArea: function() {
      this.matchArea = [];
      for(var i = 0; foodInThisArea.length > i; i++) {
        this.matchArea.push(foodInThisArea[i]);
      }
    }
  }
})

google.maps.event.addDomListener(window,'load',initMap);

document.addEventListener('DOMContentLoaded', function () {
  // Initialize ECharts instance (Globe)
  var globeChart = echarts.init(document.getElementById('globeContainer'));

  // Global variables
  let lastPopupData = null;
  // currentPollutant holds the currently selected pollutant (default NO2)
  let currentPollutant = "NO2";
  // When the user clicks “Close” the popup, we mark it as force-closed so that
  // subsequent MutationObserver updates (from poem line changes) do not re-open it
  let popupForceClosed = false;
  // To avoid redundant recentering on the same city
  let lastCity = null;
  // To detect new active poem lines so that we auto-show the popup on change
  let lastActiveLine = null;

  const pollutantSelect = document.getElementById("pollutantSelect");
  pollutantSelect.value = "NO2";

  document.getElementById('chartTitle').innerText = "Global Pollutant Tracker -- NO2";
  const changeEvent = new Event('change');
  pollutantSelect.dispatchEvent(changeEvent);

  // Define default hardcoded data (do not modify)
  const hardcodedDefaultData = {
    "Austin": {
      country: "United States of America",
      city: "Austin",
      aqi: 97,
      co: 1,
      ozone: 19,
      no2: 2,
      pm25: 97,
      lat: 30.3005,
      lng: -97.7522
    },
    "Pittsburgh": {
      country: "United States of America",
      city: "Pittsburgh",
      aqi: 53,
      co: 2,
      ozone: 36,
      no2: 10,
      pm25: 53,
      lat: 40.4397,
      lng: -79.9763
    },
    "Beijing": {
      country: "China",
      city: "Beijing",
      aqi: 151,
      co: 3,
      ozone: 119,
      no2: 1,
      pm25: 151,
      lat: 41.5757,
      lng: 120.4486
    },
    "Shanghai": {
      country: "China",
      city: "Shanghai",
      aqi: 156,
      co: 4,
      ozone: 8,
      no2: 152,
      pm25: 156,
      lat: 31.1667,
      lng: 121.4667
    },
    "New Delhi": {
      country: "India",
      city: "New Delhi",
      aqi: 500,
      co: 1,
      ozone: 2,
      no2: 446,
      pm25: 500,
      lat: 28.61,
      lng: 77.23
    },
    "Los Angeles County": {
      country: "United States of America",
      city: "Los Angeles County",
      aqi: 93,
      co: 3,
      ozone: 39,
      no2: 93,
      pm25: 93,
      lat: 33.7872,
      lng: -118.3973
    },
    "Phoenix": {
      country: "United States of America",
      city: "Phoenix",
      aqi: 72,
      co: 1,
      ozone: 4,
      no2: 23,
      pm25: 72,
      lat: 33.5722,
      lng: -112.0892
    },
    "Kolkata": {
      country: "India",
      city: "Kolkata",
      aqi: 178,
      co: 5,
      ozone: 107,
      no2: 6,
      pm25: 178,
      lat: 22.63,
      lng: 88.3
    },
    "Mumbai": {
      country: "India",
      city: "Mumbai",
      aqi: 171,
      co: 5,
      ozone: 119,
      no2: 5,
      pm25: 171,
      lat: 22.975,
      lng: 88.4344
    },
    "Patna": {
      country: "India",
      city: "Patna",
      aqi: 365,
      co: 2,
      ozone: 110,
      no2: 1,
      pm25: 307,
      lat: 25.6,
      lng: 85.1
    },
    "Lagos": {
      country: "Nigeria",
      city: "Lagos",
      aqi: 172,
      co: 7,
      ozone: 17,
      no2: 9,
      pm25: 172,
      lat: 6.455,
      lng: 3.3841
    },
    "Johannesburg": {
      country: "South Africa",
      city: "Johannesburg",
      aqi: 121,
      co: 19,
      ozone: 19,
      no2: 13,
      pm25: 121,
      lat: -26.2044,
      lng: 28.0456
    },
    "Agadez": {
      country: "Niger",
      city: "Agadez",
      aqi: 152,
      co: 1,
      ozone: 37,
      no2: 0,
      pm25: 152,
      lat: 16.9959,
      lng: 7.9828
    }
  };

  // Global variable to store pollution data points loaded from CSV (for all global points)
  var pollutionDataGlobal = [];

  // Helper function: Update infoWindow with all data fields
  function updateInfoWindow(data) {
    const infoWindow = document.getElementById('infoWindow');
    if (data) {
      infoWindow.querySelector('.info-country').innerHTML = `<strong>${data.country}</strong>`;
      infoWindow.querySelector('.info-city').textContent = data.city;
      infoWindow.querySelector('.value-aqi').textContent = data.aqi;
      infoWindow.querySelector('.value-co').textContent = data.co;
      infoWindow.querySelector('.value-ozone').textContent = data.ozone;
      infoWindow.querySelector('.value-no2').textContent = data.no2;
      infoWindow.querySelector('.value-pm25').textContent = data.pm25;
    }
  }

  // Helper function: Update main pollutant value in infoWindow based on selected pollutant
  function updateInfoWindowForPollutant(data, pollutant) {
    const infoWindow = document.getElementById('infoWindow');
    infoWindow.querySelector('.info-country').innerHTML = `<strong>${data.country}</strong>`;
    infoWindow.querySelector('.info-city').textContent = data.city;
    if (pollutant === "AQI") {
      infoWindow.querySelector('.value-aqi').textContent = data.aqi;
    } else if (pollutant === "NO2") {
      infoWindow.querySelector('.value-aqi').textContent = data.no2;
    } else if (pollutant === "O3") {
      infoWindow.querySelector('.value-aqi').textContent = data.ozone;
    } else if (pollutant === "CO") {
      infoWindow.querySelector('.value-aqi').textContent = data.co;
    } else if (pollutant === "PM2.5") {
      infoWindow.querySelector('.value-aqi').textContent = data.pm25;
    }
  }

  // Helper function: Get default city data based on the currently active poem line
  function getDataForDefaultCity() {
    let activeLine = document.querySelector('.line.active-line');
    if (activeLine) {
      let cityName = activeLine.getAttribute('data-default-city');
      if (hardcodedDefaultData.hasOwnProperty(cityName)) {
        return hardcodedDefaultData[cityName];
      }
      if (cityName && pollutionDataGlobal.length > 0) {
        let record = pollutionDataGlobal.find(rec => rec.city === cityName);
        return record || {};
      }
    }
    return { country: "", city: "", aqi: 0, co: 0, ozone: 0, no2: 0, pm25: 0 };
  }

  // On initial load, update infoWindow with the default data based on the current poem line
  updateInfoWindow(getDataForDefaultCity());

  // Load pollution data from CSV (for all global points)
  fetch('../data/processed_data/final_data.csv')
      .then(response => response.text())
      .then(csvText => {
        const lines = csvText.split('\n');
        const header = lines[0].split(',');
        let pollutionData = [];

        // Parse CSV rows starting from second line
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',');
          if (row.length < 14) continue;
          const country = row[0];
          const city = row[1];
          const aqiValue = parseFloat(row[2]);
          const coAqiValue = parseFloat(row[4]);
          const ozoneAqiValue = parseFloat(row[6]);
          const no2AqiValue = parseFloat(row[8]);
          const pm25AqiValue = parseFloat(row[10]);
          const lat = parseFloat(row[12]);
          const lng = parseFloat(row[13]);
          if (isNaN(lat) || isNaN(lng)) continue;
          let level = 1;
          if (aqiValue > 50 && aqiValue <= 100) level = 2;
          else if (aqiValue > 100 && aqiValue <= 150) level = 3;
          else if (aqiValue > 150) level = 4;
          pollutionData.push({
            country: country,
            city: city,
            aqi: aqiValue,
            co: coAqiValue,
            ozone: ozoneAqiValue,
            no2: no2AqiValue,
            pm25: pm25AqiValue,
            value: [lng, lat, 0],
            level: level
          });
        }
        // Save globally
        pollutionDataGlobal = pollutionData;

        // Set ECharts option with all loaded pollution points
        const option = {
          backgroundColor: '#444',
          globe: {
            baseTexture: '../picture/earth_bright.jpg',
            heightTexture: '',
            environment: '../picture/starfield.jpg',
            shading: 'color',
            viewControl: {
              autoRotate: false,
              enableRotate: false,
              targetCoord: [-95, 38]
            }
          },
          series: [
            {
              name: 'Pollution Points',
              type: 'scatter3D',
              coordinateSystem: 'globe',
              symbolSize: 4,      // Edit to change dot size
              symbol: 'circle',
              label: {
                show: false,
                formatter: function (params) {
                  return params.data.city;
                },
                position: 'top',
                color: 'black',
                fontWeight: 'bold'
              },
              selectedMode: 'single',
              itemStyle: {
                // Use our helper function for the initial color based on currentPollutant
                color: getColorFunction(currentPollutant),
                opacity: 0.9
              },
              data: pollutionData
            }
          ]
        };

        globeChart.setOption(option);

        // Click event: When a data point is clicked, recenter globe and show its detailed popup.
        globeChart.on('click', function (params) {
          if (params.componentType === 'series' && params.seriesType === 'scatter3D' && params.data) {
            let dataIndex = params.dataIndex;
            if (pollutionDataGlobal[dataIndex]) {
              pollutionDataGlobal[dataIndex].clicked = true;
            }
            lastPopupData = params.data;
            updateDetailedInfoPopup(params.data);
            document.getElementById('detailedInfoPopup').style.display = 'block';

            // Recenter the globe on the clicked data point
            const coord = params.data.value; // [lng, lat, 0]
            globeChart.setOption({
              globe: {
                viewControl: {
                  targetCoord: [coord[0], coord[1]]
                }
              }
            });

            // Update the series color function using currentPollutant so that it remains consistent
            globeChart.setOption({
              series: [{
                itemStyle: {
                  color: getColorFunction(currentPollutant)
                }
              }]
            });
          }
        });

        // Mouseover event: update infoWindow on hover
        globeChart.on('mouseover', function (params) {
          if (params.componentType === 'series' && params.seriesType === 'scatter3D') {
            updateInfoWindow(params.data);
            document.body.style.cursor = 'pointer';
          }
        });
      });

  // Pollutant dropdown change: update infoWindow and color mapping accordingly
  document.getElementById("pollutantSelect").addEventListener("change", function (e) {
    let pollutant = e.target.value;
    if (!pollutant) {
      pollutant = "AQI";
    }
    // Update global currentPollutant
    currentPollutant = pollutant;
    let dataToShow = lastPopupData || getDataForDefaultCity();
    updateInfoWindowForPollutant(dataToShow, pollutant);

    document.getElementById('chartTitle').innerText = "Global Pollutant Tracker -- " + pollutant;

    // Update the series color function
    let newColorFunction = getColorFunction(pollutant);
    let currentOption = globeChart.getOption();
    currentOption.series[0].itemStyle.color = newColorFunction;
    globeChart.setOption(currentOption);
    showPollutantOverlay(pollutant);
  });

  // Helper: Get the color function based on pollutant type.
  function getColorFunction(pollutant) {
    if (pollutant === "AQI") {
      return function(param) {
        if (param.data.clicked) return 'black';
        let value = param.data.aqi;
        if (value <= 50) return 'green';
        else if (value <= 100) return 'yellow';
        else if (value <= 150) return 'orange';
        else return 'red';
      };
    } else if (pollutant === "NO2") {
      return function(param) {
        if (param.data.clicked) return 'black';
        let value = param.data.no2;
        if (value < 10) return 'green';
        else if (value < 30) return 'yellow';
        else if (value < 50) return 'orange';
        else return 'red';
      };
    } else if (pollutant === "O3") {
      return function(param) {
        if (param.data.clicked) return 'black';
        let value = param.data.ozone;
        if (value < 50) return 'green';
        else if (value < 100) return 'yellow';
        else if (value < 150) return 'orange';
        else return 'red';
      };
    } else if (pollutant === "CO") {
      return function(param) {
        if (param.data.clicked) return 'black';
        let value = param.data.co;
        if (value < 5) return 'green';
        else if (value < 15) return 'yellow';
        else if (value < 30) return 'orange';
        else return 'red';
      };
    } else if (pollutant === "PM2.5") {
      return function(param) {
        if (param.data.clicked) return 'black';
        let value = param.data.pm25;
        if (value < 50) return 'green';
        else if (value < 100) return 'yellow';
        else if (value < 150) return 'orange';
        else return 'red';
      };
    }
  }

  function showPollutantOverlay(pollutant) {
    let overlay = document.createElement('div');
    overlay.id = "pollutantOverlay";
    overlay.innerHTML = `<span>Visualizing ${pollutant}</span>`;
    Object.assign(overlay.style, {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "28px",
      color: "#fff",
      zIndex: 50,
      fontWeight: "bold",
      transition: "opacity 1s ease"
    });
    const globeContainer = document.getElementById("globeContainer");
    globeContainer.style.position = "relative";
    globeContainer.appendChild(overlay);

    setTimeout(() => {
      overlay.style.opacity = 0;
      setTimeout(() => {
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 1000);
    }, 1000);
  }

  // Detailed Popup Helpers
  function updateDetailedInfoPopup(data) {
    document.getElementById('popupCountry').textContent = data.country;
    document.getElementById('popupCity').textContent = data.city;
    updatePollutantField('popupAQI', data.aqi, 'AQI');
    updatePollutantField('popupCO', data.co, 'CO');
    updatePollutantField('popupO3', data.ozone, 'O3');
    updatePollutantField('popupNO2', data.no2, 'NO2');
    updatePollutantField('popupPM25', data.pm25, 'PM2.5');
  }

  function updatePollutantField(fieldId, value, pollutant) {
    const dotColor = getColorForPollutant(pollutant, value);
    document.getElementById(fieldId).innerHTML = value +
        ' <span class="pollutant-dot" style="color: ' + dotColor + '; margin-left:5px;">&#9679;</span>';
  }

  function getColorForPollutant(pollutant, value) {
    if (pollutant === 'AQI') {
      if (value <= 50) return 'green';
      else if (value <= 100) return 'yellow';
      else if (value <= 150) return 'orange';
      else return 'red';
    }
    if (value < 40) return 'green';
    else if (value < 80) return 'yellow';
    else if (value < 120) return 'orange';
    else return 'red';
  }

  // Popup Event Handler for "Close" button only.
  document.getElementById('closePopupBtn').addEventListener('click', function() {
    document.getElementById('detailedInfoPopup').style.display = 'none';
    lastPopupData = null;
    popupForceClosed = true; // Mark popup as force-closed so that auto-popup does not reappear until a new line is activated
  });

  // Draggable Popup Implementation
  const popup = document.getElementById('detailedInfoPopup');
  const header = popup.querySelector('.popup-header');
  let isDragging = false, offsetX = 0, offsetY = 0;

  header.addEventListener('mousedown', function(e) {
    isDragging = true;
    const rect = popup.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  });

  document.addEventListener('mousemove', function(e) {
    if (isDragging) {
      popup.style.left = (e.clientX - offsetX) + 'px';
      popup.style.top = (e.clientY - offsetY) + 'px';
    }
  });

  document.addEventListener('mouseup', function() {
    isDragging = false;
  });

  // MutationObserver: Observe changes in the poem (active-line changes)
  const poemContainer = document.getElementById('poemContainer');
  const observer = new MutationObserver(function (mutationsList, observer) {
    const activeLine = poemContainer.querySelector('.line.active-line');

    if (activeLine) {
      // Skip update if the verse containing the active line is hidden
      if (window.getComputedStyle(activeLine.parentElement).display === 'none') return;

      // 如果是新活跃行，则不重置 popupForceClosed（这样关闭后不会重复弹出）
      if (activeLine !== lastActiveLine) {
        popupForceClosed = false;
        lastActiveLine = activeLine;
      }

      // Special behavior for "verse-4" (Epilogue)
      if (activeLine.parentElement.id === "verse-4") {
        document.getElementById('infoWindow').style.display = 'none';
        let lines = activeLine.parentElement.querySelectorAll('.line');
        let index = Array.prototype.indexOf.call(lines, activeLine);
        let newTexture = "";
        if (index === 0) {
          newTexture = "../picture/output1.jpg";
        } else if (index === 1) {
          newTexture = "../picture/output2.jpg";
        } else {
          newTexture = "../picture/earth_bright.jpg";
        }
        globeChart.setOption({
          globe: { baseTexture: newTexture },
          series: [{ data: [] }]
        });
      } else {
        document.getElementById('infoWindow').style.display = 'block';
        let cityName = activeLine.getAttribute('data-default-city');
        if (cityName && cityName !== lastCity && hardcodedDefaultData.hasOwnProperty(cityName)) {
          lastCity = cityName;
          const cityData = hardcodedDefaultData[cityName];
          globeChart.setOption({
            globe: {
              viewControl: {
                targetCoord: [cityData.lng, cityData.lat]
              }
            }
          });
          // Auto-show the detailed popup for the new active line unless force-closed
          if (!popupForceClosed) {
            updateDetailedInfoPopup(cityData);
            document.getElementById('detailedInfoPopup').style.display = 'block';
          }
        }
        updateInfoWindow(getDataForDefaultCity());
        globeChart.setOption({
          globe: { baseTexture: '../picture/earth_bright.jpg' },
          series: [{ data: pollutionDataGlobal }]
        });
        updatePollutantFromLine();
      }
    }
  });

  observer.observe(poemContainer, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });

  // Update pollutant based on the active line's pollutant tag
  function updatePollutantFromLine() {
    const activeLine = document.querySelector('.line.active-line');
    if (activeLine) {
      const tag = activeLine.querySelector('.pollutant-tag');
      if (tag) {
        const newPollutant = tag.getAttribute('data-pollutant');
        const pollutantSelect = document.getElementById("pollutantSelect");
        if (pollutantSelect.value !== newPollutant) {
          pollutantSelect.value = newPollutant;
          const changeEvent = new Event('change');
          pollutantSelect.dispatchEvent(changeEvent);
        }
      }
    }
  }

  // Clickable Locations in the poem: When a city name is clicked, center the globe and show the detailed popup.
  document.querySelectorAll('.clickable-location').forEach(function(element) {
    element.addEventListener('click', function(e) {
      e.stopPropagation();
      let city = this.getAttribute('data-location');
      if (city && hardcodedDefaultData.hasOwnProperty(city)) {
        const cityData = hardcodedDefaultData[city];
        globeChart.setOption({
          globe: {
            viewControl: {
              targetCoord: [cityData.lng, cityData.lat]
            }
          }
        });
        updateDetailedInfoPopup(cityData);
        document.getElementById('detailedInfoPopup').style.display = 'block';
      }
    });
  });

  // --- After page initialization, automatically display the popup for the default poem line ---
  const defaultCityData = getDataForDefaultCity();
  if(defaultCityData && defaultCityData.city) {
    updateDetailedInfoPopup(defaultCityData);
    document.getElementById('detailedInfoPopup').style.display = 'block';
    // Record the current active line to prevent the MutationObserver from triggering a duplicate popup
    lastActiveLine = document.querySelector('.line.active-line');
  }
});

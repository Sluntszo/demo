# Pollution Geographies Visualization

This project visualizes pollution data interactively on a 3D globe, providing insights into global pollutant distributions and comparative analysis between different regions.

## How to Run Locally

### Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (to load external libraries)

### Setup
1. Clone or download this repository to your local machine.
   https://github.com/mawenzhuo2022/Visualizing_Environmental_Air_Quality.git
2. Open this repository `demo`
3. Ensure the following files are present in the directory `demo`:
    - `index.html`
    - `styles.css`
    - `main.js`

## Dependencies
- ECharts
- ECharts-GL

Ensure active internet access as these libraries are loaded via CDN.

## Running the Project
- Double-click `index.html` to open it in your default web browser.
- Alternatively, run a local server (recommended for avoiding cross-origin issues):
  ```
  # Using Python 3
  python -m http.server 8000
  ```
  Then, open your browser and navigate to `http://localhost:8000`.

## Brief Explanation on the Visualization (Interactive Version)

This application is fully interactive—combining a 3D globe visualization with a poetic narrative to drive the user experience. Every user action updates the view in real time, and the various interactive components all work together to provide a dynamic exploration of global pollution data. Detailed below are all the interactive features and how they work:

### 1. Interactive Globe
- **3D Globe Rendering:**  
  The globe is rendered using [ECharts](https://echarts.apache.org/en/index.html) and [ECharts-GL](https://ecomfe.github.io/echarts-gl/). Users can rotate the globe by clicking and dragging, and zoom in or out with the mouse wheel (or via touch gestures).

- **Automatic Recentering Driven by the Poem:**
    - Each poem line (displayed on the left) has an associated default city (specified via a `data-default-city` attribute).
    - Navigating through the poem lines using the **Previous ←** and **Next →** buttons updates the active sentence. When a new sentence becomes active, the globe automatically rotates, zooms, and recenters on the city/region in that city defined in that line.
    - When the globe recenters, a detailed popup window opens automatically displaying extended pollutant data for that city.

- **Data Point Interaction:**
    - Pollution data points are plotted on the globe, with colors that dynamically correspond to the currently selected pollutant (see "Pollutant Selector").
    - Clicking a data point will recenter the globe to that specific location and open the detailed popup window with the location’s pollution data.

- **Hover Information:**
    - An information window in the bottom-left corner shows brief pollution data (such as country, city, and pollutant values) for the location currently being hovered over.
    - After eight seconds of inactivity, the info window resets to the default location defined by the active poem line (typically Texas/Austin).

### 2. Pollutant Selector
- **Location:**  
  Positioned at the top-left corner of the right panel.
- **Functionality:**
    - Users can choose among several pollutant types:
        - **AQI** (Air Quality Index)
        - **NO2** (Nitrogen Dioxide)
        - **O3** (Ozone)
        - **CO2** (Carbon Dioxide)
        - **PM2.5** (Fine Particulate Matter)
    - Changing the pollutant updates the globe’s data point colors (through specific color mapping functions for each pollutant) and also updates the pollutant value displayed in the detailed popup.

### 3. Pollution Legend
- **Location:**  
  Situated in the top-right corner.
- **Details:**  
  The legend displays the four pollution quality levels with corresponding colors:
    - **Green:** Good
    - **Yellow:** Moderate
    - **Orange:** Unhealthy for Sensitive Groups
    - **Red:** Unhealthy

### 4. Poem Visualization and Navigation
- **Layout:**  
  The poem is displayed on the left side. Each line has an associated default city and (optionally) a pollutant tag.
- **Dynamic Behavior:**
    - The first poem line is highlighted on page load. This active line determines the initial focus of the globe (e.g., Texas/Austin) and automatically opens the corresponding detailed popup.
    - **Navigation:**
        - Clicking the **Previous ←** and **Next →** buttons cycles through the poem lines.
        - As the active line changes, the globe automatically recenters to the city specified by the new line, and the pollutant updates based on any associated hidden tag.
        - Additionally, if a user clicks on a city name within the poem (marked with the class `clickable-location`), the globe immediately recenters on that city and displays its detailed popup.

### 5. Detailed Draggable Popup Window
- **Content:**  
  The detailed popup displays extended pollution data—including country, city, AQI, CO2, O3, NO2, and PM2.5—for the selected location.
- **Interactivity:**
    - The popup is draggable; users can click and drag the header to reposition it.
    - It appears automatically when the active poem line changes or when a globe data point is clicked.
    - On initial page load, the popup for the default city (Texas/Austin) automatically appears.
    - The popup can only be closed via the **Close** button. Once closed, it will remain hidden until a new active poem line reactivates it.

### 6. Information Window (Bottom Left)
- **Function:**  
  Displays brief pollutant data for a location when the user hovers over a data point on the globe.
- **Behavior:**
    - The info window updates dynamically based on mouse hover.
    - After eight seconds of no hover activity, it resets to show the data for the default city as defined by the active poem line.

### 7. Reset Button for Navigation (Final Verse)
- **Behavior:**
    - In the final verse, a “Go Back to Beginning” reset button appears, allowing users to reset the poem view and return to the initial state.
    - This button resets the active verse and line and restores the default popup and globe focus.

### 8. Navigation Buttons State
- **Behavior:**
    - The **Previous ←** button is disabled when the poem is at its very first line (i.e., the first line of the first verse).
    - The **Next →** button is disabled when the poem reaches its very last line (i.e., the last line of the final verse).

---

**Overall**, the project seamlessly blends interactive 3D globe exploration with a dynamically controlled poetic narrative. Users can investigate pollution data by directly interacting with the globe, selecting different pollutants, and navigating through the poetic interface which drives the focus and detailed information display.





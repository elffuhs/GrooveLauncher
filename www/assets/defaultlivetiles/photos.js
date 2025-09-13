/**
 * @name string Photos
 * @provide type photos
 * @author string berkaytumal
 * @description string This script displays photos from gallery.
 * @permission PHOTOS
 * @minVersion number 50
 * @supportedSizes s,m,w
 * @targetVersion number 50
 */

importScripts('./../../dist/liveTileHelper.js');

liveTileHelper.eventListener.on("draw", draw);
var photos = [];
var refreshInterval = "default"; // Default to "default" (1 minute)
var refreshTimer = null;

liveTileHelper.eventListener.on("photosdata", (data) => {
    //console.log("photos data!!!!!!!!", data)
    photos = data.photos;
    liveTileHelper.requestRedraw();
});

// Listen for refresh interval updates
liveTileHelper.eventListener.on("update-refresh-interval", (data) => {
    refreshInterval = data.interval;
    console.log("Photos live tile: Updated refresh interval to", refreshInterval);
    // Restart both timers with new interval
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
    scheduleRefresh();
    scheduleRotation(); // Also restart rotation timer
});


function draw(args) {
    const tileFeed = new liveTileHelper.TileFeed({
        type: liveTileHelper.TileType.CAROUSEL,
        animationType: liveTileHelper.AnimationType.SLIDE,
        showAppTitle: true,
        noticationCount: 0
    });
    const limitedPhotos = photos.sort(() => 0.5 - Math.random()).slice(0, 10);

    limitedPhotos.forEach(photo => {
        tileFeed.addTile(tileFeed.Tile(`<img src='${photo.photoURL}' style='position:absolute; top: 0; left: 0; width:100%; height:100%; object-fit:cover;' loading='lazy'/>`, ``));

    })
    return tileFeed;
}

// Convert refresh interval string to milliseconds
function getRefreshIntervalMs(interval) {
    switch (interval) {
        case "default":
            return 60 * 1000; // 1 minute
        case "15min":
            return 15 * 60 * 1000; // 15 minutes
        case "1hour":
            return 60 * 60 * 1000; // 1 hour
        case "4hours":
            return 4 * 60 * 60 * 1000; // 4 hours
        case "1day":
            return 24 * 60 * 60 * 1000; // 1 day
        default:
            return 60 * 1000; // Default to 1 minute
    }
}

// Schedule refresh based on the current interval setting
function scheduleRefresh() {
    const intervalMs = getRefreshIntervalMs(refreshInterval);
    console.log("Photos live tile: Scheduling refresh every", refreshInterval, "(" + intervalMs + "ms)");
    
    refreshTimer = setInterval(() => {
        console.log("Photos live tile: Refreshing photos due to interval");
        liveTileHelper.requestRedraw();
    }, intervalMs);
}

// Replace the minute scheduler with rotation based on refresh interval
var page = 0
var rotationTimer = null

function scheduleRotation() {
    // Clear existing rotation timer
    if (rotationTimer) {
        clearInterval(rotationTimer);
    }
    
    // Calculate rotation interval based on refresh interval
    // Rotate every 1/10th of the refresh interval, but minimum 10 seconds, maximum 60 seconds
    const refreshIntervalMs = getRefreshIntervalMs(refreshInterval);
    const rotationIntervalMs = Math.max(10000, Math.min(60000, refreshIntervalMs / 10));
    
    console.log("Photos live tile: Scheduling rotation every", rotationIntervalMs + "ms");
    
    rotationTimer = setInterval(() => {
        liveTileHelper.requestGoToNextPage();
        page++;
        if (page == 10) {
            liveTileHelper.requestRedraw()
        }
    }, rotationIntervalMs);
}

// Start the rotation

liveTileHelper.eventListener.on("init", init);
function init(args) {
    //console.log("Init called:", args);
    //liveTileHelper.requestRedraw();
    scheduleRotation();
    scheduleRefresh(); // Start the refresh timer
}
/*setInterval(() => {
    postMessage({
        action: "hi",
        data: { message: "naber" }
    });
}, 1000);*/
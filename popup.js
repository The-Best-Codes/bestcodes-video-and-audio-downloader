/*chrome.storage.local.get({ foundFiles: [] }, function (result) {
  var foundFiles = result.foundFiles;

  // Get the ul element from popup.html.
  var filesElement = document.getElementById("files");
  var messageElement = document.getElementById("message");

  // Check if foundFiles is empty
  if (foundFiles.length === 0) {
    var div = document.createElement("div");
    div.innerHTML =
      '<h3 style="color: grey; text-align: center; margin: 10px">No files found</h3>';
    messageElement.appendChild(div);
  } else {
    messageElement.innerHTML = "";
    // Add each found file as a div element to the ul.
    foundFiles.forEach(function (file) {
      var div = document.createElement("div");
      div.className = "file-item"; // Add a class for styling

      var fileName = document.createElement("span");
      fileName.textContent = file;
      div.appendChild(fileName);

      var downloadButton = document.createElement("button");
      downloadButton.textContent = "Download";
      downloadButton.addEventListener("click", function () {
        chrome.downloads.download({ url: file + "#ignore-cache" });
      });
      div.appendChild(downloadButton);

      // Prepend the new file at the top of the list
      filesElement.insertBefore(div, filesElement.firstChild);
    });
  }
});*/
chrome.storage.local.get({ foundFiles: [] }, function (result) {
  var foundFiles = result.foundFiles;
  refreshFilesList(foundFiles);
});

document.getElementById("clear").addEventListener("click", function () {
  // Remove all found files from chrome.storage
  var messageElement = document.getElementById("message");
  var div = document.createElement("div");
  div.innerHTML =
    '<h3 style="color: grey; text-align: center; margin: 10px">No files found</h3>';
  messageElement.innerHTML = "";
  messageElement.appendChild(div);
  chrome.storage.local.clear(function () {
    var error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    }
  });

  // Remove all file elements from the list
  var filesElement = document.getElementById("files");
  while (filesElement.firstChild) {
    filesElement.removeChild(filesElement.firstChild);
  }
});

document
  .getElementById("removeDuplicates")
  .addEventListener("click", function () {
    // Get the list of found files from chrome.storage.
    chrome.storage.local.get({ foundFiles: [] }, function (result) {
      var foundFiles = result.foundFiles;

      // Create a new array that only includes unique files.
      var uniqueFiles = [...new Set(foundFiles)];

      // Save the unique files back to chrome.storage.
      chrome.storage.local.set({ foundFiles: uniqueFiles }, function () {
        var error = chrome.runtime.lastError;
        if (error) {
          console.error(error);
        }

        // Refresh the files list.
        refreshFilesList(uniqueFiles);
      });
    });
  });

function refreshFilesList(files) {
  var filesElement = document.getElementById("files");

  // Remove all file elements from the list
  while (filesElement.firstChild) {
    filesElement.removeChild(filesElement.firstChild);
  }
  if (files.length === 0) {
    var messageElement = document.getElementById("message");
    messageElement.innerHTML = "";
    var div = document.createElement("div");
    div.innerHTML =
      '<h3 style="color: grey; text-align: center; margin: 10px">No files found</h3>';
    messageElement.appendChild(div);
  }

  // Add each file as a div element to the ul.
  files.forEach(function (file) {
    var div = document.createElement("div");
    div.className = "file-item"; // Add a class for styling
    var messageElement = document.getElementById("message");
    messageElement.innerHTML = "";

    var fileName = document.createElement("span");
    fileName.innerHTML = `<a href='${file}' target='_blank'>${file}</a><text>${file}</text>`;
    div.appendChild(fileName);

    var downloadButton = document.createElement("button");
    downloadButton.textContent = "Download";
    downloadButton.addEventListener("click", function () {
      chrome.downloads.download({ url: file });
    });
    div.appendChild(downloadButton);

    // Prepend the new file at the top of the list
    filesElement.insertBefore(div, filesElement.firstChild);
  });
}

document.getElementById("downloadAll").addEventListener("click", function () {
  // Send a message to the background script to start creating the ZIP file.
  var progressElement = document.getElementById("progress");
  progressElement.style.display = "block";
  progressElement.innerHTML = "Creating Zip File...";
  chrome.runtime.sendMessage({ action: "startCreatingZip" });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "progress") {
    var progressElement = document.getElementById("progress");
    if (request.percent === "done") {
      progressElement.style.display = "none";
    } else {
      progressElement.textContent = "Progress: " + request.percent + "%";
      progressElement.style.display = "block";
    }
  }
});

document.getElementById("refresh").addEventListener("click", function () {
  // Get the list of found files from chrome.storage.
  chrome.storage.local.get({ foundFiles: [] }, function (result) {
    var foundFiles = result.foundFiles;
    refreshFilesList(foundFiles);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  setInterval(() => {
    // Get the list of found files from chrome.storage.
    chrome.storage.local.get({ foundFiles: [] }, function (result) {
      var foundFiles = result.foundFiles;
      refreshFilesList(foundFiles);
    });
  }, 5000);
});

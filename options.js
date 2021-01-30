// Saves options to chrome.storage
function save_options() {
  var snapshot = document.getElementById('snapshot').checked;
  var embedTitle = document.getElementById('embedtitle').checked;
  var title = document.getElementById('section').value;


  chrome.storage.sync.set({
    takeSnapshot: snapshot,
    embedTitle: embedTitle,
    useTitle: title
  }, function() {
    //Update status to let user know options were saved
    //With added text animation and logo spin for flair
    var status = document.getElementById('status');
    status.classList.add('text-focus-in');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
      status.classList.remove('text-focus-in');
 }, 1000);
  var logo = document.getElementById('logo');
  logo.classList.add("spin-animtation");
  setTimeout(function(){
    logo.classList.remove("spin-animtation");
    }, 1000);

  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    takeSnapshot: true,
    embedTitle: false,
    useTitle: 'All'
  }, function(items) {
    document.getElementById('snapshot').checked = items.takeSnapshot;
    document.getElementById('embedtitle').checked = items.embedTitle;
    document.getElementById('section').value = items.useTitle;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
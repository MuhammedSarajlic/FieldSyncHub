(function () {
  var script = document.currentScript;
  if (!script) return;
  var workspaceId = script.getAttribute('data-workspace-id');
  if (!workspaceId) return;
  var iframe = document.createElement('iframe');
  iframe.src = new URL('/book/' + encodeURIComponent(workspaceId), script.src).href;
  iframe.title = 'Request service';
  iframe.style.width = '100%';
  iframe.style.minHeight = '720px';
  iframe.style.border = '0';
  script.parentNode.insertBefore(iframe, script);
})();

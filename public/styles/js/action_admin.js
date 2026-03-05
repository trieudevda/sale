document.addEventListener("DOMContentLoaded", function() {

})
function action_search_list( id , url ){
    let data = document.getElementById( id ).value;
    let reUrl = url + '?name=' + data;
// console.log(reUrl)
    window.location.href = reUrl;
}

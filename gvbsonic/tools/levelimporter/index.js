var lvlexp = document.getElementById("levelexp");
var lvlimp = document.getElementById("imp");
lvlexp.onchange = function () {
  try{
  var data = eval("(function () { return "+lvlexp.value.replaceAll("\n"," ")+";})();");
  lvlimp.value = JSON.stringify(data,null,"\t");
  }catch(e){window.alert(e);}
};
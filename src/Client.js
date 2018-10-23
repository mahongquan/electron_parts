import queryString from 'querystring';
const Pooling = require('generic-pool');
console.log(Pooling);
var socket=require("./data/seq");
var host="";
function myFetch(method,url,body,cb,headers2,err_callback) {
}
function getRaw(url,cb,err_callback) {
  console.log(url);
  let un_url=unescape(url);
  console.log(un_url);
  let wds=un_url.split("/");
  let paras=wds[2].split("?");
  url="/get/"+paras[0];
  // let paras_un=unescape(paras[1]);
  let ps=paras[1].split("&");
  let data={};
  for(var i=0;i<ps.length;i++){
    let pp=ps[i].split("=");
    data[pp[0]]=pp[1];
  }
  
  socket.emit(url,data,cb);
}
function get(url,data,cb,err_callback) {
  let wds=url.split("/");
  let paras=wds[2].split("?");
  url="/get/"+paras[0];
  socket.emit(url,data,cb);
}
function post(url,data,cb,err_callback) {
  let wds=url.split("/");
  let paras=wds[2].split("?");
  url="/post/"+paras[0];
  socket.emit(url,data,cb);
}
function put(url,data,cb,err_callback) {
  let wds=url.split("/");
  let paras=wds[2].split("?");
  url="/put/"+paras[0];
  socket.emit(url,data,cb);
}
function delete1(url,data,cb,err_callback) {
  let wds=url.split("/");
  let paras=wds[2].split("?");
  url="/delete/"+paras[0];
  socket.emit(url,data,cb);
}
function postOrPut(url,data,cb) {
  var method="POST"
  if (data.id){
    put(url,data,cb);
  }
  else{
    post(url,data,cb);
  }
}
function postForm(url,data,cb) {
  var method="POST"
  return fetch(url,
  {
      method: method,
      credentials: 'include',
      body: data
  }).then(checkStatus)
    .then(parseJSON)
    .then(cb).catch((error) => {
      //console.log(error)
      alert(error+"\n请刷新网页/登录");
    });
}
function contacts(data, cb,err_callback) {
  //console.log(data);
  socket.emit("/get/Contact",data,cb);//,err_callback)
  // socket.emit("");
}
function UsePacks(query, cb) {
  var data={contact:query}
  return get("/rest/UsePack",data,cb)
}
function PackItems(query, cb) {
  var data={pack:query}
  return get("/rest/PackItem",data,cb)
}
function items(query, cb) {
  var data={search:query}
  return get("/rest/Item",data,cb)
}
function login_index( cb) {
  return get("/rest/login",undefined,cb) 
}
function logout( cb) {
 return get("/rest/logout",undefined,cb) 
}

function login(username,password,cb) {//post form
  var payload = {
    username: username,
    password: password,
  };
  var body= queryString.stringify( payload )
  return myFetch("POST","/rest/login",body,cb, {'Content-Type':'application/x-www-form-urlencoded'})
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(`HTTP Error ${response.statusText}`);
  error.status = response.statusText;
  error.response = response;
  // console.log(error); // eslint-disable-line no-console
  //alert("请刷新网页")
  throw error;
}

function parseJSON(response) {
  //console.log("parse");
  //window.response=response;
  //for var i in response.headers.entries();
  //console.log(response);
  // console.log(response.headers.get("content-type"));
  // if(response.headers.get("content-type")==="text/html; charset=utf-8")
  // {
  //   const error = new Error("无效响应");
  //   //alert("\n请登录")
  //   throw error;
  // }
  // else{
    var r= response.json();
    return r;
  //}
}
const Client = {getRaw,contacts,items,login_index,login,logout,UsePacks,PackItems,get,post,postOrPut,delete1,postForm};
export default Client;

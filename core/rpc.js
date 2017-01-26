/**
 * Created by buhe on 16/4/12.
 */
import conf from './conf.js';
import RNFetchBlob from 'react-native-fetch-blob';


/**
 * 直传文件
 * formInput对象如何配置请参考七牛官方文档“直传文件”一节
 */
function uploadFile(uri, token, formInput) {
  if (typeof formInput !== 'object') {
    return false;
  }

  let formData = new FormData();
  for (let k in formInput) {
    formData.append(k, formInput[k]);
  }
  if (!formInput.file) formData.append('file', {uri: uri, type: 'application/octet-stream'});
  if (!formInput.token) formData.append('token', token);

  let options = {};
  options.body = formData;
  options.method = 'POST';
  return fetch(conf.UP_HOST, options);
}


/**
 *
 * 直传文件，使用xhr的方案
 *
 */
function uploadFile2(uri, token, key, onprogress) {
  return new Promise((resolve, reject)=>{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(e) {
      onprogress && onprogress(e);
    };
    xhr.open('POST', conf.UP_HOST);
    xhr.onload = () => {
      if (xhr.status !== 200) {
        reject && reject(xhr);
        return;
      }

      resolve && resolve(xhr);
    };
    var formdata = new FormData();
    formdata.append("key", key);
    formdata.append("token", token);
    formdata.append("file", {uri:uri, type:'application/octet-stream', name:uri.match(/[^\/]+$/)[0]});

    xhr.send(formdata);
  });
}

/**
 * Use react-native-fetch-blob to fix large file issue
 */
export function uploadFile3(uri, token, key, name) {

  if (typeof name == 'undefined') {
    var filePath = uri.split("/");
    if (filePath.length > 0) {
      name = filePath[filePath.length - 1];
    } else {
      name = "";
    }
  }

  return RNFetchBlob.fetch('POST', conf.UP_HOST, {
    'Content-Type' : 'multipart/form-data',
  }, [
    { name: 'file', filename: name, type: 'application/octet-stream', data: RNFetchBlob.wrap(uri)},
    { name : 'key', data : key},
    { name : 'token', data : token},
  ]);
}


//发送管理和fop命令,总之就是不上传文件
function post(uri, adminToken, content) {
  var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  let payload = {
    headers: headers,
    method: 'POST',
    dataType: 'json',
    timeout: conf.RPC_TIMEOUT,
  };
  if (typeof content === 'undefined') {
    payload.headers['Content-Length'] = 0;
  } else {
    //carry data
    payload.body = content;
  }

  if (adminToken) {
    headers['Authorization'] = adminToken;
  }

  return fetch(uri, payload);
}

export default {uploadFile, uploadFile2, post}

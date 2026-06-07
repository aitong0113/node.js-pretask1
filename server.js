// 拿出建立網站的工具
const { log } = require('console');
const http = require('http');

const { v4: uuidv4 } = require('uuid'); // 拿出 uuid 這個套件裡的 v4 方法，並且改名為 uuidv4
const errorHandle = require('./errorhandle'); // 引入 errorHandle.js

const todos = []; // 用來存放待辦事項的陣列


// 建立一台 Server。
const requestListener = (req, res) => {
  ////共用同一份設定
    const headers = {
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
      'Content-Type': 'application/json'
    }
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });

    // 根據用戶端送來的請求內容，回應不同的內容
    if(req.url === '/todos' && req.method === 'GET'){
      // 回應首頁內容
      res.writeHead(200, headers);
      res.write(JSON.stringify({
                "status": "success",
                "data": todos,
                }));
      res.end();

    }else if(req.url === '/todos' && req.method === 'POST'){
      req.on('end', () => {
        try{
          const title = JSON.parse(body).title;

          if(title !== undefined){
          const newTodo = {
            "title": title,
            "id": uuidv4(),
          };
          todos.push(newTodo);
          res.writeHead(200, headers);
          res.write(JSON.stringify({
              "status": "success",
              "data": todos,
              }));
              res.end();
          }else{
            errorHandle(res);
          }

        }catch(error){
          errorHandle(res);
        } 
    })


    }else if(req.url === '/todos' && req.method === 'DELETE'){
      todos.length = 0; // 清空陣列
      res.writeHead(200, headers);
      res.write(JSON.stringify({
                "status": "success",
                "data": todos,
                }));
      res.end();

    }else if(req.url.startsWith('/todos/') && req.method === 'DELETE'){
      const id = req.url.split('/').pop(); // 從 URL 中提取 ID
      const index = todos.findIndex(element => element.id == id); // 找到對應 ID 的待辦事項索引
      if(index !== -1){
        todos.splice(index, 1); // 刪除對應 ID 的待辦事項
  
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        "status": "success",
        "data": todos,
      }));
      res.end();

    }else{
      errorHandle(res);
    }


    

    }else if(req.url.startsWith('/todos/') && req.method === 'PATCH'){
    req.on('end', () => {
      try{
        const id = req.url.split('/').pop(); // 從 URL 中提取 ID
        const title = JSON.parse(body).title; // 從請求體中提取新的標題
        const index = todos.findIndex(element => element.id == id); // 找到對應 ID 的待辦事項索引

        if(index !== -1 && title !== undefined){
          todos[index].title = title; // 更新對應 ID 的待辦事項標題

          res.writeHead(200, headers);
          res.write(JSON.stringify({
            "status": "success",
            "data": todos,
          }));
          res.end();
        }else{
          errorHandle(res);
        }

      }catch(error){
        errorHandle(res);
      }
    });
 


  }else if(req.method == "OPTIONS"){ // 這裡是處理 CORS 預檢請求的部分
      res.writeHead(200, headers);
      res.end(); 

    }else{
      // 回應 404 not found
      res.writeHead(404 , headers);
      res.write(JSON.stringify({
                "status": "error",
                "message": "無此路由",
                }));
      res.end();
    }

}


// 啟動 Server
const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);


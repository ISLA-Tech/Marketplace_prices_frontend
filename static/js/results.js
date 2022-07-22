function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let fetchAndDisplayResults = async function(){
  return axios.post(apiServer + '/getqueryresult', { QueryId:  queryId})
  .then(function (response) {
    let data = response.data.Result.value;

    //Display result
    let table = document.getElementById("resultTable");
    let csv = data.split("\n");
    //Create header
    let row = csv[0];
    let header = table.createTHead();
    let tr = header.insertRow();
    for (let col of row.split(",")) {
      let td = tr.insertCell();
      td.innerHTML = col;
    }
    //Fill in data
    console.log(csv);
    csv.shift();//Remove the header
    for (let row of csv) {
      let tr = table.insertRow();
      for (let col of row.split(",")) {
        let td = tr.insertCell();
        td.innerHTML = col;
      }
    }
  })
  .catch(function (error) {
    console.log(error);
    displayMsg("Error. Probably the API server isn't running now.");
  });
}

let displayMsg = async function(msg){
  document.getElementById("UserMsg").innerHTML = msg;
}

//Returns "Finished" or "Unprocessed" or "Processing" or "Error"
let getScraperStatus = async function(){
  return axios.post(apiServer + '/querystatus', { QueryId:  queryId})
  .then(function (response) {
    console.log("Query " + queryId + " status: " + response.data.Status);
    //If scraper finished: return "Finished"
    if(response.data.Status == "Finished"){
      return "Finished";
    }else if (response.data.Status == "Unprocessed"){//Otherwise return false
      return "Unprocessed";
    }else{//Otherwise return "Processing"
      return "Processing";
    }
  })
  .catch(function (error) {
    console.log(error);
    return "Error";
  });
}


let main = async function(){
  let scraperFinished = false;
  let count = 0;
  let timeout = 600;//Capped to 10 minutes
  while(!scraperFinished && count < timeout){
    //Retrieve the status of the scraper from the api endpoint /querystatus
    let status = await getScraperStatus();
    //Display an appropriate message, or continue waiting
    if(status == "Finished"){
      scraperFinished = true;
    }else if(status == "Unprocessed"){
      displayMsg("Unprocessed query");
      return;//Return from main()
    }else if(status == "Processing"){
      displayMsg("The scraper is running, please wait!<br>Still processing" + ".".repeat((count % 3)+1));
    }else{
      displayMsg("Error. Probably the API server isn't running now.");
      break;//End the loop
    }

    await sleep(1000);
    count++;
  }

  if(scraperFinished){
    fetchAndDisplayResults();
    displayMsg("Here are the results of your search :)");
  }else{
    displayMsg("Timed out. Running time is capped to 10 minutes. Please reduce the number of researches in your query.");
  }
}

main();

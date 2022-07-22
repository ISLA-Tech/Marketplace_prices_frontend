console.log(queryId);
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let fetchAndDisplayResults = async function(){

}

let displayMsg = async function(msg){
  document.getElementById("UserMsg").innerHTML = msg;
}

//Returns "Finished" or "Unprocessed" or "Processing" or "Error"
let getScraperStatus = async function(){
  console.log(queryId);
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
    //fetchAndDisplayResults();
    console.log("Gonna fetch results when it's coded :)");
  }else{
    console.log("Timed out...");
  }
}

main();

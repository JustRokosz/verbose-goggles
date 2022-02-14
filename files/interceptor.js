import axiosHttpAdapter from "axios/lib/adapters/http.js";

let requests = [];
let requestsPromises;

function batchInterceptor(instance) {
  instance.interceptors.request.use(
      (request) => {
        // it's impossible to rewrite response data in axios by default, so axios allows to define "request/response adapter"
        // to do some custom handling. In this case it's needed to assign sliced response to requests that have been made
        // so each gets what requested, not all the responses
        //https://axios-http.com/docs/req_config (adapter section)
        //https://github.com/axios/axios/tree/master/lib/adapters
        request.adapter = () =>
            makeBatchRequests(request).then(createResolver(request));

        return request;
      },
      (error) => Promise.reject(error)
  );
}

// collect requests until given timeout is exceeded, then send the request and clean the array
const makeBatchRequests = (config) => {
  if (!objectIsEmpty(requests)) {
    requests.push(config);

    return requestsPromises;
  } else {
    requests.push(config);
    requestsPromises = new Promise((resolve, reject) => {
      // send batch request after 500ms
      setTimeout(() => {
        axiosHttpAdapter(createBatchConfig(config))
            .then(resolve)
            .catch(reject)
            .finally(() => (requests = []));
      }, 500);
    });

    return requestsPromises;
  }
};

// collect unique ids of resources
const collectIds = () => {
  return requests.reduce((acc, current) => {
    const ids = current.params.ids || [];

    ids.forEach(item => {
      if(acc.indexOf(item) === -1) {
        acc.push(item);
      };
    });

    return acc;
  }, []);
};

// merge current request config with recently collected IDs for batch
const createBatchConfig = (config) => {
  const idsBatch = collectIds();
  if (objectIsEmpty(idsBatch)) {
    return config;
  }

  return { ...config, params: { ...config.params, ids: idsBatch } };
};

// find response for each request sent in batch request and return only this piece to caller
const createResolver = (config) => {
  return (res) => {
    console.log("Assigning response from batch response to", config.params)

    const ids = config.params.ids || [];
    const data = JSON.parse(res.data);

    const items = data.items.filter((item) => {
      console.log(item, "items", data.items);
      return ids.indexOf(item.id) > -1;
    });

    if (objectIsEmpty(items)) {
      return Promise.reject("batch response has no item with id=" + ids);
    }

    return Promise.resolve({ ...res, data: { items } });
  };
};

const objectIsEmpty = (obj) => {
  for (let x in obj) { 
    return false; 
  }
  return true;
};

export default batchInterceptor;

const apiVersion = "v1";
export const GetUnitAPI = async () => {};

export const GetCostMatrixAPI = async (division) => {
  let response = await fetch(
    `http://localhost:3000/api/${apiVersion}/getCostMatrix?division_name=${division}`
  );
  let responseJson = await response.json();
  return responseJson;
};

export const GetDivisionRuleAPI = async (division) => {
  let response = await fetch(
    `http://localhost:3000/api/${apiVersion}/getDivisionUnitRuleUnit?division_name=${division}`
  );
  let responseJson = await response.json();
  return responseJson;
};

export const PostDeckAPI = async (deck) => {
  const myData = { ...deck };
  let response = await fetch(`http://localhost:3000/api/${apiVersion}/deck`, {
    method: "POST",
    body: JSON.stringify(myData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  let responseJson = await response.json();
  return responseJson;
};

export const GetDeckAPI = async (deckId) => {
  let response = await fetch(
    `http://localhost:3000/api/${apiVersion}/deck?id=${deckId}`
  );
  let responseJson = await response.json();
  return responseJson;
};

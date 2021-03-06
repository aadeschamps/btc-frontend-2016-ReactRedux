import {
  CALL_API,
  Schemas
} from '../api/serverApi.js';

const types = ['SEARCH_REQUEST', 'SEARCH_SUCCESS', 'SEARCH_FAILURE'];

function fetchSearchData(searchTerm) {
  
  return {
    [CALL_API]: {
      types: types,
      endpoint: `candidate_search/${searchTerm}/`,
      schema: Schemas.LIST
    }
  }
}

export default function loadSearchData(searchTerm, requiredFields = []) {
  return (dispatch, getState) => {
    // TODO: Add push state here once we refactor the reducer
    return dispatch(fetchSearchData(searchTerm))
  }
}
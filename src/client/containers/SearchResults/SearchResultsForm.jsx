import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col, Button, Input } from 'react-bootstrap';
import { fetchSearchData } from '../../actions/index.js';
import Autosuggest from 'react-autosuggest';
import fetchSuggestions from '../../utils/fetchSuggestions.js';

function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getMatches(value,dataArr) {
  const escapedValue = escapeRegexCharacters(value.trim());
  if (escapedValue === '') {
    return [];
  }
  const regex = new RegExp('^' + escapedValue, 'i');
  return dataArr.filter(data => regex.test(data.candidate_name));
}

function getSuggestionValue(suggestion) {
  return suggestion.candidate_name;
}

function renderSuggestion(suggestion) {
  return (
    <span>{suggestion.candidate_name}</span>
  );
}

class SearchResultsForm extends Component {

    constructor(props, content) {
        super(props, content);
        this.handleFetch = this.handleFetch.bind(this);
        this.state = {
            value: '',
            suggestions: getMatches(''),
            errorMessage: false,
            isLoading: false
        };
        this.onChange = this.onChange.bind(this);
        this.onSuggestionsUpdateRequested = this.onSuggestionsUpdateRequested.bind(this);
        this.setRef = this.setRef.bind(this);
    }
    loadSuggestions(value) {
      this.setState({
        isLoading: true
      });
        fetchSuggestions(value).then((data)=>{

        let dataArr = [...data.candidate_names,...data.related]
        const suggestions = getMatches(value,dataArr);

        if (value === this.state.value) {
          this.setState({
            isLoading: false,
            suggestions
          });
        } else {
          this.setState({
            isLoading: false
          })
        }
      })
    }

    onChange(event, { newValue }) {
      this.setState({
        value: newValue
      });
    }

    onSuggestionSelected(event, { suggestionValue }) {
      this.loadSuggestions(suggestionValue);
    }

    onSuggestionsUpdateRequested({ value }) {
      this.loadSuggestions(value);
    }

    setRef(ref){
    this.searchTermRef = ref;
    }

    handleFetch(e) {
        e.preventDefault();
        e.stopPropagation();
        const {dispatch} = this.props;
        const searchTerm = this.searchTermRef;
        dispatch(fetchSearchData(searchTerm));
    }

    render() {
      const {status, statusText} = this.props;
      const { value, suggestions, isLoading } = this.state;
      const inputProps = {
      placeholder: 'Search for candidates, measures or PAC name',
      value,
      className: 'form-control input-group',
      onChange: this.onChange
    };
        let enterMessage = false;
        let errorMessage = false;
        let fetchButton = null;

        if (this.state.value.length > 0){
          enterMessage = (
            <p style={{color:'#888'}}>Press Enter/return to search</p>
          );
        }
        if (status === 'error') {
          errorMessage = (
            <div colSpan="12">
            <p>We did not find a match for [term(s)]. Please update your search and try again.</p>
            <strong>Tips:</strong>
            <ol>
              <li>Check your spelling.</li>
              <li>If you are not sure what to search, try browsing for a candidate, donor, measure, PAC name or corporation.</li>
              <li>Let us know if you think there is an issue with our site.</li>
            </ol>
          </div>
          );
        }
        if (status === 'loading') {
            fetchButton = (<Button bsStyle="default"
                                    disabled={true}>
                               <span>Searching</span>
                           </Button>
            );
            setTimeout(()=>{
              fetchButton = (<Button bsStyle="default">
                                 <span>Search</span>
                             </Button>)
            },3000);
        } else {
            fetchButton = (<Button bsStyle="default" type = "submit">

                               <span>Search</span>
                           </Button>
            );
        }

        const iconstyle = {
          position: 'absolute',
          top: '10px',
          right: '30px',
          color: '#888'
        }
        return (<form {...this.props} onSubmit={ this.handleFetch }>
                    <Grid fluid={ true }>
                        <Row>
                            <Col xs={ 12 }
                                 md={ 12 }
                                 sm={ 12 }
                                 lg={ 12 }>

                                 <Autosuggest ref={()=>this.setRef(this.state.value)}
                                   suggestions={suggestions}
                                   onSuggestionsUpdateRequested={this.onSuggestionsUpdateRequested}
                                   getSuggestionValue={getSuggestionValue}
                                   renderSuggestion={renderSuggestion}
                                   inputProps={inputProps} />
                                 <i style={iconstyle} className={"fa fa-search"}></i>
                                 {enterMessage}
                               {errorMessage}
                          </Col>
                        </Row>

                    </Grid>

                </form>);
    }
}
function mapStateToProps(state) {
    const {searchData: {fetching: {status, statusText},searchTerm}} = state;
    return {
        searchTerm,
        status,
        statusText
    };
}

export default connect(mapStateToProps)(SearchResultsForm);

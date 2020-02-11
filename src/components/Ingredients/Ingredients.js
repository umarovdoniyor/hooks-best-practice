import React, {useState, useReducer, useCallback} from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import Search from "./Search";

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error("Should not get there!");
  }
};

const httpReducer = (currHttpState, action) => {
  switch (action.type) {
    case "SEND":
      return {loading: true, error: null};
    case "RESPONSE":
      return {...currHttpState, loading: false};
    case "ERROR":
      return {loading: false, error: action.errorMessage};
    case "CLEAR":
      return {...currHttpState, error: null};
  }
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: null
  });
  // const [userIngredients, setUserIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

  // useEffect(() => {
  //   fetch("https://react-hooks-practice-c7b86.firebaseio.com/ingredients.json")
  //     .then(response => response.json())
  //     .then(responseData => {
  //       console.log(responseData);
  //       const loadedIngredients = [];
  //       for (const key in responseData) {
  //         loadedIngredients.push({
  //           id: key,
  //           title: responseData[key].title,
  //           amount: responseData[key].amount
  //         });
  //       }
  //       setUserIngredients(loadedIngredients);
  //     });
  // }, []);

  const addIngredientHandler = ingredient => {
    // setIsLoading(true);
    dispatchHttp({type: "SEND"});
    fetch(
      "https://react-hooks-practice-c7b86.firebaseio.com/ingredients.json",
      {
        method: "POST",
        body: JSON.stringify(ingredient),
        headers: {"Content-Type": "application/json"}
      }
    )
      .then(response => {
        // setIsLoading(false);
        dispatchHttp({type: "RESPONSE"});

        return response.json();
      })
      .then(responseData => {
        // setUserIngredients(prevIngredients => [
        //   ...prevIngredients,
        //   {id: responseData.name, ...ingredient}
        // ]);
        dispatch({
          type: "ADD",
          ingredient: {id: responseData.name, ...ingredient}
        });
      });
  };

  const removeIngredientHandler = ingredientId => {
    // setIsLoading(true);
    dispatchHttp({type: "SEND"});
    fetch(
      `https://react-hooks-practice-c7b86.firebaseio.com/ingredients/${ingredientId}.json`,
      {
        method: "DELETE"
      }
    )
      .then(response => {
        dispatchHttp({type: "RESPONSE"});
        // setIsLoading(false);
        // setUserIngredients(prevIngredients =>
        //   prevIngredients.filter(ingredient => ingredient.id !== ingredientId)
        // );
        dispatch({type: "DELETE", id: ingredientId});
      })
      .catch(error => {
        dispatchHttp({type: "ERROR", errorMessage: "Something went wrong!!!"});
        // setError("Something went wrong!");
        // setIsLoading(false);
      });
  };

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    // setUserIngredients(filteredIngredients);
    dispatch({type: "SET", ingredients: filteredIngredients});
  }, []);

  const clearError = () => {
    // setError(null);
    // isLoading(false);
    dispatchHttp({type: "CLEAR"});
  };

  return (
    <div className="App">
      {httpState.error && (
        <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;

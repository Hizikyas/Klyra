import { useReducer } from "react";

const initialState = { enteredValue: "", isTouched: false };

const reducerFunction = (state: any, action: any) => {
  if (action.type === "value")
    return { enteredValue: action.value, isTouched: true };

  if (action.type === "blur")
    return { enteredValue: state.enteredValue, isTouched: true };

  if (action.type === "reset") {
    return initialState;
  }

  return initialState;
};

const useInput = (validateValue: (value: string) => boolean) => {
  const [state, dispatch] = useReducer(reducerFunction, initialState);

  const enteredValid = validateValue(state.enteredValue);
  const inValid = !enteredValid && state.isTouched;

  const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    dispatch({ type: "value", value: event.target.value });
  };

  const inputBlurHandler = () => {
    dispatch({ type: "blur" });
  };

  const reset = () => {
    dispatch({ type: "reset" });
  };

  return {
    inputHandler,
    inputBlurHandler,
    enteredValue: state.enteredValue,
    enteredValid,
    inValid,
    reset,
  };
};

export default useInput;

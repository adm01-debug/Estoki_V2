import { useReducer, useCallback, Reducer, Dispatch } from 'react';
type Middleware<S, A> = (state: S, action: A, next: Dispatch<A>) => void;
export function useReducerWithMiddleware<S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
  middlewares: Middleware<S, A>[] = []
): [S, Dispatch<A>] {
  const [state, dispatch] = useReducer(reducer, initialState);
  const dispatchWithMiddleware = useCallback((action: A) => {
    middlewares.forEach(middleware => middleware(state, action, dispatch));
    dispatch(action);
  }, [state, middlewares]);
  return [state, dispatchWithMiddleware];
}

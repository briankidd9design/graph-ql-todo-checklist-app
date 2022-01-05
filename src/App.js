import React from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
// import { gql } from '@apollo/client';
//add todos
//toggle todos
//delete todos
//list todos

const GET_TODOS = gql`
  query getTodos {
    todos {
      done
      id
      text
    }
  }
`;

const TOGGLE_TODO = gql`
  mutation toggleTodo($id: uuid!, $done: Boolean!) {
    update_todos(where: { id: { _eq: $id } }, _set: { done: $done }) {
      returning {
        done
        id
        text
      }
    }
  }
`;
const ADD_TODO = gql`
  mutation addTodo($text: String!) {
    insert_todos(objects: { text: $text }) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const DELETE_TODO = gql`
  mutation deleteTodo($id: uuid!) {
    delete_todos(where: { id: { _eq: $id } }) {
      returning {
        done
        id
        text
      }
    }
  }
`;

function App() {
  // const stuff =  useQuery(GET_TODOS)
  const [todoText, setTodoText] = React.useState("");
  const { data, loading, error } = useQuery(GET_TODOS);
  const [toggleTodo] = useMutation(TOGGLE_TODO);
  const [deleteTodo] = useMutation(DELETE_TODO);
  const [addTodo] = useMutation(ADD_TODO, {
    onCompleted: () => setTodoText(" "),
  });

  // useMutation(DELETE_TODO);

  // function handleToggleTodo(todo) {
  //   toggleTodo({ variables: { id: todo.id, done: !todo.done } });
  // }
  //destructured values
  async function handleToggleTodo({ id, done }) {
    //set done to the opposite boolean value
    const data = await toggleTodo({ variables: { id, done: !done } });
    console.log("toggled todo", data);
  }

  async function handleAddTodo(event) {
    event.preventDefault();
    if (!todoText.trim()) return;
    const data = await addTodo({
      variables: { text: todoText },
      //this refetches the query after performing the mutation
      refetchQueries: [{ query: GET_TODOS }],
    });
    console.log("added todo", data);
    setTodoText('');
  }

  async function handleDeleteTodo({ id }) {
    const isConfirmed = window.confirm("Do you want to delete this todo?");
    if (isConfirmed) {
      const data = await deleteTodo({
        variables: { id },
        //updating the cache
        update: (cache) => {
          //Read from the cache for a given query when a mutation has taken place
          const prevData = cache.readQuery({ query: GET_TODOS });
          //The cache doesn't know about this so we manually update the cache
          //The filter method filters out the id that was selected for deletion
          const newTodos = prevData.todos.filter((todo) => todo.id !== id);
          //The write back to the query
          cache.writeQuery({ query: GET_TODOS, data: { todos: newTodos } });
        },
      });
      console.log("Delete todo", data);
    }
  }

  if (loading) return <div>Loading todos...</div>;
  if (error) return <div>Error fetching todos!</div>;
  // console.log(stuff);
  return (
    <div className="vh-100 code flex flex-column items-center bg-purple white pa4 fl-1">
      <div>
        <h1 className="f2-l">
          GraphQL Checklist{" "}
          <span role="img" aria-label="Checkmark">
            ✅
          </span>
        </h1>
        <form onSubmit={handleAddTodo} className="mb3">
          <input
            className="pa2 f4 b--dashed"
            type="text"
            placeholder="Write Your Todo"
            //using the useState hook to set the state to the value of the user input
            onChange={(event) => setTodoText(event.target.value)}
            //this makes it a controlled component 
            //Please see: https://reactjs.org/docs/uncontrolled-components.html
            value={todoText} 
            //the value is controlled by state
          />
          <button className="pa2 f4 bg-green" type="submit">
            Create
          </button>
        </form>
      </div>
      <div className="flex items-center justify-center flex-column">
        {data.todos.map((todo) => (
          <p 
            onDoubleClick={() => handleToggleTodo(todo)}
            key={todo.id}
          >
            <span className={`pointer list pa1 f3 ${todo.done && "strike"}`}>
              {todo.text}
            </span>
            <button
              onClick={() => handleDeleteTodo(todo)}
              className="bg-transparent bn f4"
            >
              <span className="red">&times;</span>
            </button>
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;

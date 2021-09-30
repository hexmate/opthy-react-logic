import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export function App(props) {
  return (
      <>
        <h1>
          Hello {props.name}
        </h1>
        <button type="button" class="btn btn-primary">
          This is a bootstrap button
        </button>
      </>
    );
}
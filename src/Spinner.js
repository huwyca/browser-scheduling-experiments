import React from "react";

export default class Spinner extends React.Component {
  state = { degree: 0 };

  componentDidMount() {
    requestAnimationFrame(this.tick);
  }

  tick = () => {
    requestAnimationFrame(this.tick);

    this.setState({
      degree: this.state.degree + 5
    });
  };

  render() {
    return (
      <div
        style={{
          height: "200px",
          width: "200px",
          flex: "0 0 auto",
          textAlign: "center",
          display: "inline-block",
          boxShadow: "0 0 1px 1px rgba(0, 0, 0, 0.2)",
          borderRadius: "2px",
          padding: "8px 12px",
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          margin: "4px",
          transform: "rotateY(" + this.state.degree + "deg)"
        }}
      >
        <h1>Spinner</h1>
      </div>
    );
  }
}

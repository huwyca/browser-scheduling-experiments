import React from "react";

export default class Slider extends React.PureComponent {
  state = { steps: 0 };
  step = 5;

  componentDidMount() {
    requestAnimationFrame(this.tick);
  }

  tick = () => {
    requestAnimationFrame(this.tick);
    if (this.state.steps > 250) {
      this.step = -5;
    }

    if (this.state.steps < 0) {
      this.step = 5;
    }
    this.setState({ steps: this.state.steps + this.step });
  };

  render() {
    return (
      <div
        style={{
          height: "200px",
          width: "200px",
          flex: "0 0 auto",
          display: "inline-block",
          boxShadow: "0 0 1px 1px rgba(0, 0, 0, 0.2)",
          borderRadius: "2px",
          padding: "8px 12px",
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          margin: "4px",
          position: "relative",
          left: this.state.steps
        }}
      >
        <h1>Slider</h1>
      </div>
    );
  }
}

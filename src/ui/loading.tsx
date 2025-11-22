import styled from 'styled-components';

const StyledWrapper = styled.div`
  .loader {
    height: 60px;
    aspect-ratio: 2;
    border-bottom: 3px solid #0000;
    background: linear-gradient(90deg, #524656 50%, #0000 0) -25% 100%/50% 3px repeat-x border-box;
    position: relative;
    animation: l3-0 0.75s linear infinite;
  }
  .loader:before {
    content: "";
    position: absolute;
    inset: auto 42.5% 0;
    aspect-ratio: 1;
    border-radius: 50%;
    background: #cf4647;
    animation: l3-1 0.75s cubic-bezier(0, 900, 1, 900) infinite;
  }
  @keyframes l3-0 {
    to {
      background-position: -125% 100%;
    }
  }
  @keyframes l3-1 {
    0%, 2% {
      bottom: 0%;
    }
    98%, to {
      bottom: 0.1%;
    }
  }
`;

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader" />
    </StyledWrapper>
  );
}

export default Loader;
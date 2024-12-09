import PropTypes from "prop-types";
import "./InsureRec.css";

const InsuranceRecommendation = ({ recommendation, onRestart }) => {
  return (
    <div className="recommendation-container">
      <h2>Recommended Insurance Policy</h2>

      <div className="recommendation-details">
        <div>
          <h3>Policy Name</h3>
          <p>{recommendation.policyName}</p>
        </div>

        <div>
          <h3>Description</h3>
          <p>{recommendation.description}</p>
        </div>

        {/* Conditionally render coverage if available */}
        {recommendation.reasons && recommendation.reasons.length > 0 && (
          <div>
            <h3>Reasons for Recommendation</h3>
            <ul>
              {recommendation.reasons.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Ensure coverage, price, and additionalInfo are only rendered if available */}
        {recommendation.coverage && recommendation.coverage.length > 0 && (
          <div>
            <h3>Coverage</h3>
            <ul>
              {recommendation.coverage.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {recommendation.price && (
          <div>
            <h3>Price</h3>
            <p>{recommendation.price}</p>
          </div>
        )}

        {recommendation.additionalInfo && (
          <div>
            <h3>Additional Information</h3>
            <p>{recommendation.additionalInfo}</p>
          </div>
        )}

        <button onClick={onRestart}>Start New Recommendation</button>
      </div>
    </div>
  );
};

InsuranceRecommendation.propTypes = {
  recommendation: PropTypes.shape({
    policyName: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    reasons: PropTypes.arrayOf(PropTypes.string), // Make sure reasons is optional here
    coverage: PropTypes.arrayOf(PropTypes.string), // Optional, can be missing
    price: PropTypes.string, // Optional, can be missing
    additionalInfo: PropTypes.string, // Optional, can be missing
  }).isRequired,
  onRestart: PropTypes.func.isRequired,
};

export default InsuranceRecommendation;

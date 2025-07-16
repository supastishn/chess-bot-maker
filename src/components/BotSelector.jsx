const BotSelector = ({ selectedBot, onChange, bots }) => (
  <div className="bot-selector">
    <label>Active Bot:</label>
    <select value={selectedBot} onChange={e => onChange(e.target.value)}>
      {bots.map(name => (
        <option key={name} value={name}>{name}</option>
      ))}
    </select>
  </div>
);

export default BotSelector;

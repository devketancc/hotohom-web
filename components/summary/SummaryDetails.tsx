export const SummaryDetails = () => {
  return (
    <div className="space-y-2 p-4 border rounded shadow-sm text-sm">
      <h3 className="font-semibold text-lg border-b pb-2">Summary</h3>
      <p className="flex justify-between"><span>Base:</span><span>₹0</span></p>
      <p className="flex justify-between"><span>Tax:</span><span>₹0</span></p>
      <div className="pt-2 border-t font-semibold flex justify-between">
        <span>Total:</span>
        <span>₹0</span>
      </div>
    </div>
  );
};

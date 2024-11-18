export const lineNames = {
  1: "Bus 1 - Bus 4",
  2: "Bus 4 - Bus 5",
  3: "Bus 5 - Bus 6",
  4: "Bus 3 - Bus 6",
  5: "Bus 6 - Bus 7",
  6: "Bus 7 - Bus 8",
  7: "Bus 8 - Bus 2",
  8: "Bus 8 - Bus 9",
  9: "Bus 9 - Bus 4"
};

export const formatConstraintDescription = (description: string): string => {
  // Replace branch numbers with line names
  const branchMatch = description.match(/Branch (\d+)/g);
  if (branchMatch) {
    let formattedDesc = description;
    branchMatch.forEach(match => {
      const branchNum = parseInt(match.replace('Branch ', ''));
      const lineName = lineNames[branchNum as keyof typeof lineNames];
      if (lineName) {
        formattedDesc = formattedDesc.replace(match, `${match} (${lineName})`);
      }
    });
    return formattedDesc;
  }
  return description;
};
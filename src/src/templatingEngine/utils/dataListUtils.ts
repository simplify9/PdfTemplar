export const getFromDataList = (lookUp: string, dataList: any): any => {
  const lookUpArr = lookUp.split('.');
  //if (!dataList) initializeDataList(canvasPageProps);

  //recursively look through data list.

  let lookUpResult: any = dataList[lookUpArr[0]];
  if (lookUpArr.length > 1 && lookUpResult)
    for (let i = 1; i < lookUpArr.length; i++) {
      if(lookUpResult) lookUpResult = lookUpResult[lookUpArr[i]]
      else return "";
    }

  return lookUpResult;
}

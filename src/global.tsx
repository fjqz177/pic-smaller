import { makeObservable, observable } from "mobx";
import { normalize } from "./functions";
import { history } from "./router";
import { LocaleData } from "./type";
import { Initial } from "./Initial";

export class GlobalState {
  public pathname: string = normalize(history.location.pathname);
  public page: null | React.ReactNode = (<Initial />);
  public lang: string = "en-US";
  public locale: LocaleData | null = null;
  public loading: boolean = false;
  constructor() {
    makeObservable(this, {
      pathname: observable,
      page: observable.ref,
      lang: observable,
      locale: observable,
      loading: observable,
    });
  }
}

export const gstate = new GlobalState();

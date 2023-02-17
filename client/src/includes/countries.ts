import axios from "axios";
import { CountryData } from "../types/countryData";

export function getCountry(id: string) {
 return axios
		.get<CountryData>(`https://restcountries.com/v2/alpha/${id}`)
		.then((res) => res.data)
}
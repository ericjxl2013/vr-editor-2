import Qs from 'qs';

// import { getToken } from '@/utils/auth';

// 创建axios实例
const instance = axios.create({
	// baseURL: 'http://127.0.0.1:8080/',
	baseURL: 'https://admin.veryengine.cn/',
	withCredentials : true,
	//headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
	headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}
});

instance.interceptors.response.use(
	response => {
		if (response.data.code) {
			if (response.data.code === '99998'||response.data.code === '99999') {
               // window.location.href="http://localhost:4080/";
				return Promise.reject(response.data.message);
			}
		}
		return response;
	},
	error => {
		// 默认除了2XX之外的都是错误的，就会走这里
		if (error.response) {
			switch (error.response.status) {
				case 401:
					console.log(`401: ${error.response.status}`);
					break;
				default:
					console.log(`error返回: ${error.response.status}`);
			}
		}
		return Promise.reject(error);
	}
);

export const getBlob=(url:string)=>axios.get(url,{responseType:'blob'});

export const PostParam=(url:string,data:{})=>instance.post(url,Qs.stringify(data),{headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}});

export const PostJson=(url:string,data:{})=>instance.post(url,JSON.stringify(data),{headers: { 'Content-Type': 'application/json;charset=UTF-8'}});

export const Get=(url:string)=> instance.get(url);




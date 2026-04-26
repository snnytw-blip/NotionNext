import random
import re
import ssl
import time

import requests
import argparse

ssl._create_default_https_context = ssl._create_unverified_context


# 1日のプッシュ制限数。必要に応じて変更してください。
QUOTA = 100


def parse_sitemap(site):
    site = f'{site}/sitemap.xml'
    try:
        result = requests.get(site)
        big = re.findall('<loc>(.*?)</loc>', result.content.decode('utf-8'), re.S)
        return list(big)
    except:
        print('URLに誤りがないか確認してください。')
        print('正しい形式は、https:// を含み、末尾に "sitemap.xml" を含まない完全なドメインです。例：')
        print('正しい例: https://ghlcode.cn')
        print('詳細はこちらを参照: https://ghlcode.cn/fe032806-5362-4d82-b746-a0b26ce8b9d9')



def push_to_bing(site, urls, api_key):
    endpoint = f"https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey={api_key}"

    payload = {
        "siteUrl": site,
        "urlList": urls
    }

    try:
        response = requests.post(endpoint, json=payload)
        result = response.json()
        if response.status_code == 200:
            print("Bing へのプッシュに成功しました。")
        elif "ErrorCode" in result:
            print("Bing へのプッシュ中にエラーが発生しました。エラーメッセージ：", result["Message"])
    except Exception as e:
        print("エラーが発生しました:", e)


def push_to_baidu(site, urls, token):
    api_url = f"http://data.zz.baidu.com/urls?site={site}&token={token}"

    payload = "\n".join(urls)
    headers = {"Content-Type": "text/plain"}

    try:
        response = requests.post(api_url, data=payload, headers=headers)
        result = response.json()
        if "success" in result and result["success"]:
            print("百度 へのプッシュに成功しました。")
        elif "error" in result:
            print("百度 へのプッシュ中にエラーが発生しました。エラーメッセージ：", result["message"])
        else:
            print("百度からの不明なレスポンス:", result)
    except Exception as e:
        print("エラーが発生しました:", e)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='sitemap を解析してプッシュ')
    parser.add_argument('--url', type=str, default=None, help='ウェブサイトの URL')
    parser.add_argument('--bing_api_key', type=str, default=None, help='Bing API キー')
    parser.add_argument('--baidu_token', type=str, default=None, help='百度プッシュトークン')
    args = parser.parse_args()

    # 現在のタイムスタンプをランダムシードとして使用
    current_timestamp = int(time.time())
    random.seed(current_timestamp)

    if args.url:
        # URL を解析
        urls = parse_sitemap(args.url)
        if urls is not None:
            # URL 数が制限を超えているか確認し、超えている場合は制限数（デフォルト 100）までランダムに抽出
            if len(urls) > QUOTA:
                urls = random.sample(urls, QUOTA)
            # Bing へプッシュ
            if args.bing_api_key:
                print('Bing へプッシュしています。お待ちください……')
                push_to_bing(args.url, urls, args.bing_api_key)
            # 百度へプッシュ
            if args.baidu_token:
                print('百度へプッシュしています。お待ちください……')
                push_to_baidu(args.url, urls, args.baidu_token)
    else:
        print('Github Action Secrets で URL を設定してください。')
        print('詳細はこちらを参照: https://ghlcode.cn/fe032806-5362-4d82-b746-a0b26ce8b9d9')

export default function ErrorPage({ statusCode }) {
  return <div>エラーが発生しました。ステータスコード：{statusCode || 404}</div>
}
ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}
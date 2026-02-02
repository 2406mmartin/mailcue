import TextInput from "../../components/TextInput.jsx";

export default function General({ settings }) {
  return (
    <>
      <TextInput
        label="Organization Name"
        fill={true}
        button={true}
        buttonLabel="Save"
        value={settings.organization_name}
      ></TextInput>
    </>
  );
}

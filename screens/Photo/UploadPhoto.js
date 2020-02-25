import React, { useState } from "react";
import { Image, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import styled from "styled-components";
import { gql } from "apollo-boost";
import useInput from "../../hooks/useInput";
import styles from "../../styles";
import constants from "../../constants";
import { useMutation } from "react-apollo-hooks";
import { FEED_QUERY } from "../Tabs/Home";

const UPLOAD = gql`
  mutation upload($caption: String!, $files: [String!]!, $location: String) {
    upload(caption: $caption, files: $files, location: $location) {
      id
      caption
      location
    }
  }
`;

const View = styled.View`
  flex: 1;
`;

const Container = styled.View`
  padding: 20px;
  flex-direction: row;
`;

const Form = styled.View`
  justify-content: flex-start;
`;

const STextInput = styled.TextInput`
  margin-bottom: 10px;
  border: 0px solid ${styles.lightGreyColor};
  border-bottom-width: 1px;
  padding-bottom: 10px;
  width: ${constants.width - 180};
`;

const Button = styled.TouchableOpacity`
  background-color: ${styles.blueColor};
  padding: 10px;
  border-radius: 4px;
  align-items: center;
  justify-content: center;
`;

const Text = styled.Text`
  color: white;
  font-weight: 600;
`;

export default ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const photo = navigation.getParam("photo");
  const captionInput = useInput("");
  const locationInput = useInput("");
  const [uploadMutation] = useMutation(UPLOAD, {
    refetchQueries: () => [{ query: FEED_QUERY }]
  });
  const handleSubmit = async () => {
    if (captionInput.value === "" || locationInput.value === "") {
      Alert.alert("All fields are required");
    }
    const formData = new FormData();
    const name = photo.filename;
    const [, type] = name.split(".");

    formData.append("file", {
      name,
      type: "image/jpeg",
      uri: photo.uri
    });

    try {
      setLoading(true);
      const {
        data: { location } // data에 response data가 담겨져 있음
      } = await axios.post(
        "https://prismagram-hansol.herokuapp.com/api/upload",
        formData,
        {
          headers: {
            "content-type": "multipart/form-data"
          }
        }
      );
      const {
        data: { upload }
      } = await uploadMutation({
        variables: {
          caption: captionInput.value,
          location: locationInput.value,
          files: [location]
        }
      });
      if (upload.id) {
        navigation.navigate("TabNavigation");
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Can't upload", "Try later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Container>
        <Image
          source={{ uri: photo.uri }}
          style={{ height: 80, width: 80, marginRight: 30 }}
        />
        <Form>
          <STextInput
            onChangeText={captionInput.onChange}
            value={captionInput.value}
            placeholder={"Caption"}
            multiline={true}
            placeholderTextColor={styles.darkGreyColor}
          />
          <STextInput
            onChangeText={locationInput.onChange}
            value={locationInput.value}
            placeholder={"Location"}
            multiline={true}
            placeholderTextColor={styles.darkGreyColor}
          />
          <Button onPress={handleSubmit}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text>Upload</Text>
            )}
          </Button>
        </Form>
      </Container>
    </View>
  );
};
